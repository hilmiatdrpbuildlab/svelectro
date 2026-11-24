import { IMAGE_MAX_BYTES, readUpload, toInt } from './files';
import { newKey, type Storage } from './storage';

export interface StoredImage {
	url: string;
	key: string;
	thumbUrl: string | null;
	thumbKey: string | null;
	width: number | null;
	height: number | null;
}

/**
 * Validates and stores one image (+ optional thumbnail) in the public bucket.
 * The browser sends `<field>` (optimised WebP), `<field>_thumb`, `<field>_w`, `<field>_h`; without
 * JavaScript only `<field>` arrives (the original JPEG/PNG/WebP) and the thumbnail is skipped.
 */
export async function storeImage(
	storage: Storage,
	file: FormDataEntryValue | null,
	thumb: FormDataEntryValue | null,
	folder: string,
	size?: { w: FormDataEntryValue | null; h: FormDataEntryValue | null }
): Promise<{ ok: true; image: StoredImage } | { ok: false; error: string } | null> {
	const main = await readUpload(file, { maxBytes: IMAGE_MAX_BYTES, label: 'Afbeelding' });
	if (!main) return null;
	if (!main.ok) return main;

	const key = newKey(folder, main.type.ext);
	await storage.put('public', key, main.bytes, main.type.mime);

	let thumbKey: string | null = null;
	const t = await readUpload(thumb, { maxBytes: IMAGE_MAX_BYTES, label: 'Miniatuur' });
	if (t?.ok) {
		thumbKey = key.replace(/\.\w+$/, `-thumb.${t.type.ext}`);
		await storage.put('public', thumbKey, t.bytes, t.type.mime);
	}

	return {
		ok: true,
		image: {
			url: storage.publicUrl(key),
			key,
			thumbUrl: thumbKey ? storage.publicUrl(thumbKey) : null,
			thumbKey,
			width: size ? toInt(size.w) : null,
			height: size ? toInt(size.h) : null
		}
	};
}
