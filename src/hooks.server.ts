import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import { serverEnv } from '$lib/server/env';
import { createStorage, type Storage } from '$lib/server/storage';

const SECURITY_HEADERS: Record<string, string> = {
	'strict-transport-security': 'max-age=31536000; includeSubDomains',
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
	'x-frame-options': 'DENY'
};

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

export const handle: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);

	// Edge cache for public pages: Cloudflare does not cache Worker responses by itself, so
	// public GETs go through the Cache API, honouring the s-maxage the page sets (60 s).
	const cache = event.platform?.caches?.default;
	const cacheable =
		cache &&
		event.request.method === 'GET' &&
		!event.url.pathname.startsWith('/admin') &&
		!event.url.searchParams.has('nocache');
	if (cacheable) {
		const hit = await cache.match(event.request);
		if (hit) return hit;
		const response = await handleUncached({ event, resolve });
		if (response.status === 200 && /s-maxage=\d+/.test(response.headers.get('cache-control') ?? '')) {
			event.platform?.context?.waitUntil(cache.put(event.request, response.clone()));
		}
		return response;
	}
	return handleUncached({ event, resolve });
};

const handleUncached: Handle = async ({ event, resolve }) => {

	const db = createDb(serverEnv.databaseUrl);
	let storage: Storage | null = null;
	event.locals.db = db;
	event.locals.storage = () => (storage ??= createStorage(serverEnv.storage));
	event.locals.user = null;

	const path = event.url.pathname;
	const isAdmin = path === '/admin' || path.startsWith('/admin/');

	if (isAdmin) {
		event.locals.user = await validateSession(
			db,
			event.cookies.get(SESSION_COOKIE),
			serverEnv.authSecret,
			event.cookies,
			event.url.protocol === 'https:'
		);
		if (!event.locals.user && !PUBLIC_ADMIN_PATHS.has(path)) {
			const next = path === '/admin' ? '' : `?next=${encodeURIComponent(path + event.url.search)}`;
			redirect(303, `/admin/login${next}`);
		}
	}

	const response = await resolve(event);
	for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!response.headers.has(k)) response.headers.set(k, v);
	if (isAdmin) {
		response.headers.set('cache-control', 'private, no-store');
		response.headers.set('x-robots-tag', 'noindex, nofollow');
	}
	return response;
};
