import { getSettings } from '$lib/server/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, setHeaders }) => {
	// Short shared cache: CMS edits show up within a minute.
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
	return { settings: await getSettings(locals.db) };
};
