import { and, like, ne } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { slugify } from '$lib/content';
import type { Db } from './db';

/** `base`, or `base-2`, `base-3`… whichever is free in `table`. */
export async function uniqueSlug(
	db: Db,
	table: PgTable & { slug: PgColumn; id: PgColumn },
	input: string,
	excludeId?: string
) {
	const base = slugify(input);
	const rows = await db
		.select({ slug: table.slug })
		.from(table)
		.where(excludeId ? and(like(table.slug, `${base}%`), ne(table.id, excludeId)) : like(table.slug, `${base}%`));
	const taken = new Set(rows.map((r) => r.slug as string));
	if (!taken.has(base)) return base;
	for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

