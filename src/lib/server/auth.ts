import type { Cookies } from '@sveltejs/kit';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { Db } from './db';
import { adminSessions, adminUsers } from './db/schema';

export const SESSION_COOKIE = 'sv_session';
const SESSION_DAYS = 14;
const RENEW_WHEN_DAYS_LEFT = 7;

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) =>
	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Only an HMAC of the token is stored: a leaked sessions table cannot be replayed as cookies. */
async function sessionId(token: string, secret: string) {
	const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign'
	]);
	return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(token)));
}

function setCookie(cookies: Cookies, token: string, expires: Date, secure: boolean) {
	cookies.set(SESSION_COOKIE, token, { path: '/', httpOnly: true, sameSite: 'lax', secure, expires });
}

export async function createSession(db: Db, userId: string, secret: string, cookies: Cookies, secure: boolean) {
	const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
	await db.insert(adminSessions).values({ id: await sessionId(token, secret), userId, expiresAt });
	setCookie(cookies, token, expiresAt, secure);
}

export async function validateSession(
	db: Db,
	token: string | undefined,
	secret: string,
	cookies: Cookies,
	secure: boolean
) {
	if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
	const id = await sessionId(token, secret);
	const [row] = await db
		.select({
			expiresAt: adminSessions.expiresAt,
			user: { id: adminUsers.id, email: adminUsers.email, name: adminUsers.name }
		})
		.from(adminSessions)
		.innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
		.where(and(eq(adminSessions.id, id), gt(adminSessions.expiresAt, new Date())))
		.limit(1);
	if (!row) return null;

	// Sliding expiry: renew once less than a week is left.
	if (row.expiresAt.getTime() - Date.now() < RENEW_WHEN_DAYS_LEFT * 86_400_000) {
		const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
		await db.update(adminSessions).set({ expiresAt }).where(eq(adminSessions.id, id));
		setCookie(cookies, token, expiresAt, secure);
	}
	return row.user;
}

export async function destroySession(db: Db, token: string | undefined, secret: string, cookies: Cookies) {
	if (token && /^[0-9a-f]{64}$/.test(token))
		await db.delete(adminSessions).where(eq(adminSessions.id, await sessionId(token, secret)));
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function purgeExpiredSessions(db: Db) {
	await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}
