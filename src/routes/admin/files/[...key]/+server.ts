import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Streams a quote-request attachment from the private bucket. Admins only (see hooks). */
export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) error(401, 'Niet aangemeld');
	const key = params.key;
	if (!/^inquiries\/[\w/-]+\.(jpg|png|webp|pdf)$/.test(key)) error(404, 'Niet gevonden');
	const obj = await locals.storage().get('private', key);
	if (!obj) error(404, 'Niet gevonden');
	const name = url.searchParams.get('name')?.replace(/["\r\n]/g, '') || key.split('/').pop()!;
	return new Response(obj.body as BodyInit, {
		headers: {
			'content-type': obj.contentType,
			'content-disposition': `${url.searchParams.has('download') ? 'attachment' : 'inline'}; filename="${name}"`,
			'cache-control': 'private, no-store',
			// The type was verified by magic bytes on upload (JPG/PNG/WebP/PDF only).
			'x-content-type-options': 'nosniff'
		}
	});
};
