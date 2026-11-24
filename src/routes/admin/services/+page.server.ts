import { fail } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { runBatch } from '$lib/server/db';
import { services } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	services: await locals.db
		.select({
			id: services.id,
			title: services.title,
			shortDescription: services.shortDescription,
			iconName: services.iconName,
			coverImageUrl: services.coverImageUrl,
			isActive: services.isActive
		})
		.from(services)
		.orderBy(asc(services.sortOrder), asc(services.createdAt))
});

export const actions: Actions = {
	toggle: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		await locals.db.update(services).set({ isActive: sql`not ${services.isActive}` }).where(eq(services.id, id));
		return { message: 'Zichtbaarheid bijgewerkt.' };
	},
	reorder: async ({ request, locals }) => {
		const ids = (await request.formData()).getAll('order').map(String);
		if (!ids.length) return fail(400, { error: 'Geen volgorde ontvangen.' });
		const db = locals.db;
		await runBatch(db, ids.map((id, i) => db.update(services).set({ sortOrder: i }).where(eq(services.id, id))));
		return { message: 'Volgorde opgeslagen.' };
	}
};
