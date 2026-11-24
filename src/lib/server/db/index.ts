import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Drizzle over Neon's HTTP driver: one fetch per query, no long-lived sockets, so it is safe on
 * Cloudflare Workers. Multi-statement writes use `db.batch([...])`, which Neon runs as one
 * transaction.
 */
export function createDb(url: string) {
	return drizzle({ client: neon(url), schema, casing: 'snake_case' });
}

export type Db = ReturnType<typeof createDb>;
export { schema };

import type { BatchItem } from 'drizzle-orm/batch';

/** db.batch for a dynamic list of statements (one transaction on Neon). No-op when empty. */
export async function runBatch(db: Db, queries: BatchItem<'pg'>[]) {
	if (!queries.length) return;
	await db.batch(queries as [BatchItem<'pg'>, ...BatchItem<'pg'>[]]);
}
