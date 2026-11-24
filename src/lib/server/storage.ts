/**
 * Neon Object Storage through the S3 API. Every bucket call in the app goes through this file.
 *
 * - `media` bucket (public_read): site photos. Objects are served straight from
 *   `<endpoint>/<bucket>/<key>`, so the Worker never proxies image bytes.
 * - `private` bucket: quote-request attachments. Only streamed to signed-in admins via
 *   /admin/files/[...key].
 *
 * Neon requires path-style addressing (`forcePathStyle: true`).
 */
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export interface StorageConfig {
	endpoint: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	privateBucket: string;
}

export type BucketKind = 'public' | 'private';

export function createStorage(cfg: StorageConfig) {
	const s3 = new S3Client({
		endpoint: cfg.endpoint,
		region: cfg.region,
		forcePathStyle: true,
		maxAttempts: 3,
		credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
	});
	// The SDK retries throttling and 5xx; this also retries DNS/connection failures.
	const client = {
		send: (async (command: Parameters<typeof s3.send>[0]) => {
			for (let attempt = 1; ; attempt++) {
				try {
					return await s3.send(command);
				} catch (e) {
					if (attempt >= 3 || !isNetworkError(e)) throw e;
					await new Promise((r) => setTimeout(r, 250 * attempt));
				}
			}
		}) as typeof s3.send
	};
	const bucketOf = (kind: BucketKind) => (kind === 'public' ? cfg.bucket : cfg.privateBucket);

	return {
		/** Public URL of an object in the public bucket. */
		publicUrl(key: string) {
			return `${cfg.endpoint}/${cfg.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
		},
		async put(kind: BucketKind, key: string, body: Uint8Array, contentType: string) {
			await client.send(
				new PutObjectCommand({
					Bucket: bucketOf(kind),
					Key: key,
					Body: body,
					ContentType: contentType,
					// Keys are unique per upload, so objects never change.
					CacheControl: kind === 'public' ? 'public, max-age=31536000, immutable' : 'private, no-store'
				})
			);
			return { key, url: kind === 'public' ? this.publicUrl(key) : null };
		},
		async get(kind: BucketKind, key: string) {
			try {
				const res = await client.send(new GetObjectCommand({ Bucket: bucketOf(kind), Key: key }));
				if (!res.Body) return null;
				return {
					body: await res.Body.transformToByteArray(),
					contentType: res.ContentType ?? 'application/octet-stream'
				};
			} catch (e) {
				if (isNotFound(e)) return null;
				throw e;
			}
		},
		/** Deletes are best effort: a missing object is not an error. */
		async delete(kind: BucketKind, ...keys: (string | null | undefined)[]) {
			await Promise.all(
				keys
					.filter((k): k is string => !!k)
					.map((Key) =>
						client.send(new DeleteObjectCommand({ Bucket: bucketOf(kind), Key })).catch((e) => {
							if (!isNotFound(e)) console.error('storage delete failed', Key, e);
						})
					)
			);
		}
	};
}

export type Storage = ReturnType<typeof createStorage>;

function isNetworkError(e: unknown) {
	const err = e as { code?: string; name?: string; message?: string; cause?: { code?: string } };
	const code = err?.code ?? err?.cause?.code ?? '';
	return (
		['ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'UND_ERR_SOCKET'].includes(code) ||
		err?.name === 'TimeoutError' ||
		/network|fetch failed|socket/i.test(err?.message ?? '')
	);
}

function isNotFound(e: unknown) {
	const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
	return err?.name === 'NoSuchKey' || err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404;
}

/** `projects/2026/11/<uuid>.webp`: unique, never reused, so objects can be cached forever. */
export function newKey(folder: string, ext: string) {
	const d = new Date();
	const month = String(d.getUTCMonth() + 1).padStart(2, '0');
	return `${folder}/${d.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${ext}`;
}
