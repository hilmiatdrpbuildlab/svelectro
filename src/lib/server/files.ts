/**
 * Upload validation. The file type is decided by the bytes (magic numbers), never by the name or
 * the browser-supplied MIME type. The CMS converts photos to WebP in the browser before upload
 * (lib/client/image.ts); without JavaScript the original JPEG/PNG/WebP is accepted as-is.
 */
export const IMAGE_MAX_BYTES = 12 * 1024 * 1024;
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export interface Sniffed {
	ext: 'jpg' | 'png' | 'webp' | 'pdf';
	mime: string;
}

export function sniff(bytes: Uint8Array): Sniffed | null {
	const b = bytes;
	if (b.length < 12) return null;
	if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
	if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', mime: 'image/png' };
	if (
		b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
		b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
	)
		return { ext: 'webp', mime: 'image/webp' };
	if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return { ext: 'pdf', mime: 'application/pdf' };
	return null;
}

export type FileCheck =
	| { ok: true; bytes: Uint8Array; type: Sniffed }
	| { ok: false; error: string };

export async function readUpload(
	file: FormDataEntryValue | null,
	opts: { maxBytes: number; allowPdf?: boolean; label?: string }
): Promise<FileCheck | null> {
	if (!(file instanceof File) || file.size === 0) return null;
	const label = opts.label ?? 'Bestand';
	if (file.size > opts.maxBytes)
		return { ok: false, error: `${label} is te groot (max. ${Math.round(opts.maxBytes / 1024 / 1024)} MB).` };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const type = sniff(bytes);
	if (!type || (type.ext === 'pdf' && !opts.allowPdf))
		return {
			ok: false,
			error: `${label}: alleen ${opts.allowPdf ? 'JPG, PNG, WebP of PDF' : 'JPG, PNG of WebP'} is toegestaan.`
		};
	return { ok: true, bytes, type };
}

export const toInt = (v: FormDataEntryValue | null) => {
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};
