import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const today = new Date().toISOString().slice(0, 10);
	const urls = [
		{ loc: `${url.origin}/`, priority: '1.0' },
		{ loc: `${url.origin}/privacy`, priority: '0.2' }
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' }
	});
};
