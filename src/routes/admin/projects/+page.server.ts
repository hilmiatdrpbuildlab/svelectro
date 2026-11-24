import { fail } from '@sveltejs/kit';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { runBatch } from '$lib/server/db';
import { projectImages, projects } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;
	const [rows, covers] = await db.batch([
		db
			.select({
				id: projects.id,
				title: projects.title,
				category: projects.category,
				location: projects.location,
				featured: projects.featured,
				sortOrder: projects.sortOrder,
				imageCount: sql<number>`(select count(*)::int from ${projectImages} where ${projectImages.projectId} = ${projects.id})`
			})
			.from(projects)
			.orderBy(asc(projects.sortOrder), desc(projects.createdAt)),
		db
			.select({ projectId: projectImages.projectId, url: projectImages.thumbUrl, full: projectImages.imageUrl })
			.from(projectImages)
			.where(eq(projectImages.isCover, true))
	]);
	const coverOf = new Map(covers.map((c) => [c.projectId, c.url ?? c.full]));
	return { projects: rows.map((r) => ({ ...r, cover: coverOf.get(r.id) ?? null })) };
};

export const actions: Actions = {
	toggleFeatured: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		await locals.db.update(projects).set({ featured: sql`not ${projects.featured}` }).where(eq(projects.id, id));
		return { message: 'Bijgewerkt.' };
	},
	/** Saves the full order (ids in display order) after a move. */
	reorder: async ({ request, locals }) => {
		const ids = (await request.formData()).getAll('order').map(String);
		if (!ids.length) return fail(400, { error: 'Geen volgorde ontvangen.' });
		const db = locals.db;
		await runBatch(db, ids.map((id, i) => db.update(projects).set({ sortOrder: i }).where(eq(projects.id, id))));
		return { message: 'Volgorde opgeslagen.' };
	}
};
