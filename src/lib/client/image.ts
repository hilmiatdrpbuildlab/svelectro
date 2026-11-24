/**
 * Browser-side image optimisation for CMS uploads: phone photos (often 4–8 MB, 4000 px) are
 * resized and re-encoded to WebP before they leave the browser, so uploads are fast and the
 * Worker never has to process images. EXIF orientation is applied by createImageBitmap.
 */
export interface Optimised {
	file: File;
	thumb: File | null;
	width: number;
	height: number;
}

async function encode(bitmap: ImageBitmap, max: number, quality: number, name: string) {
	const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(bitmap, 0, 0, w, h);
	const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality));
	// Safari < 17 cannot encode WebP and silently returns PNG: fall back to JPEG then.
	const out =
		blob && blob.type === 'image/webp'
			? blob
			: await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality)
				);
	const ext = out.type === 'image/webp' ? 'webp' : 'jpg';
	return { file: new File([out], `${name}.${ext}`, { type: out.type }), w, h };
}

export async function optimiseImage(file: File, opts: { max?: number; thumb?: number | false } = {}): Promise<Optimised> {
	const { max = 2000, thumb = 720 } = opts;
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	try {
		const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
		const full = await encode(bitmap, max, 0.8, base);
		const small = thumb ? await encode(bitmap, thumb, 0.74, `${base}-thumb`) : null;
		return { file: full.file, thumb: small?.file ?? null, width: full.w, height: full.h };
	} finally {
		bitmap.close();
	}
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * For use in a `use:enhance` submit callback: replaces every image in `field` with its optimised
 * version and appends `<field>_thumb`, `<field>_w`, `<field>_h` (one entry per file, in order).
 * Files the browser cannot decode are left untouched for the server to validate.
 */
export async function optimiseFormImages(
	formData: FormData,
	field: string,
	opts?: { max?: number; thumb?: number | false }
) {
	const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
	if (!files.length) return;
	formData.delete(field);
	for (const f of files) {
		if (!ACCEPTED.includes(f.type)) {
			formData.append(field, f);
			formData.append(`${field}_thumb`, new File([], ''));
			formData.append(`${field}_w`, '');
			formData.append(`${field}_h`, '');
			continue;
		}
		try {
			const o = await optimiseImage(f, opts);
			formData.append(field, o.file);
			formData.append(`${field}_thumb`, o.thumb ?? new File([], ''));
			formData.append(`${field}_w`, String(o.width));
			formData.append(`${field}_h`, String(o.height));
		} catch {
			formData.append(field, f);
			formData.append(`${field}_thumb`, new File([], ''));
			formData.append(`${field}_w`, '');
			formData.append(`${field}_h`, '');
		}
	}
}
