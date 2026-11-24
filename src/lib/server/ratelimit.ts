import { and, count, eq, gt, lt } from 'drizzle-orm';
import type { Db } from './db';
import { rateLimitEvents } from './db/schema';

const enc = new TextEncoder();

/** IPs are never stored in clear: SHA-256(secret + ip), truncated. */
export async function clientKey(ip: string, secret: string) {
	const digest = await crypto.subtle.digest('SHA-256', enc.encode(`${secret}:${ip}`));
	return [...new Uint8Array(digest)]
		.slice(0, 16)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/** True when `key` already has `limit` events in `bucket` within the window. */
export async function isLimited(db: Db, bucket: string, key: string, limit: number, windowMs: number) {
	const since = new Date(Date.now() - windowMs);
	const [row] = await db
		.select({ n: count() })
		.from(rateLimitEvents)
		.where(and(eq(rateLimitEvents.bucket, bucket), eq(rateLimitEvents.key, key), gt(rateLimitEvents.createdAt, since)));
	return (row?.n ?? 0) >= limit;
}

export async function recordEvent(db: Db, bucket: string, key: string) {
	await db.insert(rateLimitEvents).values({ bucket, key });
	// Opportunistic cleanup of events older than a day.
	if (Math.random() < 0.05)
		await db.delete(rateLimitEvents).where(lt(rateLimitEvents.createdAt, new Date(Date.now() - 86_400_000)));
}

export async function clearEvents(db: Db, bucket: string, key: string) {
	await db.delete(rateLimitEvents).where(and(eq(rateLimitEvents.bucket, bucket), eq(rateLimitEvents.key, key)));
}
