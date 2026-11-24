import { sql } from 'drizzle-orm';
import { DEFAULT_SETTINGS, type SiteSettings } from '$lib/content';
import type { Db } from './db';
import { siteSettings } from './db/schema';

/** All settings groups, each merged over its defaults (so new fields never break old rows). */
export async function getSettings(db: Db): Promise<SiteSettings> {
	const rows = await db.select().from(siteSettings);
	return mergeSettings(rows);
}

export function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
	const out = structuredClone(DEFAULT_SETTINGS) as SiteSettings;
	const target = out as unknown as Record<string, unknown>;
	for (const r of rows) {
		if (!(r.key in out)) continue;
		const def = target[r.key];
		target[r.key] = Array.isArray(def) ? r.value : { ...(def as object), ...(r.value as object) };
	}
	return out;
}

export async function saveSetting<K extends keyof SiteSettings>(db: Db, key: K, value: SiteSettings[K]) {
	await db
		.insert(siteSettings)
		.values({ key, value })
		.onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: sql`now()` } });
}
