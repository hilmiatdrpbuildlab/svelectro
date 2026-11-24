import { desc, eq, sql } from 'drizzle-orm';
import { projects, testimonials } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	testimonials: await locals.db
		.select({
			id: testimonials.id,
			clientName: testimonials.clientName,
			companyOrCity: testimonials.companyOrCity,
			rating: testimonials.rating,
			quote: testimonials.quote,
			isPublished: testimonials.isPublished,
			createdAt: testimonials.createdAt,
			projectTitle: projects.title
		})
		.from(testimonials)
		.leftJoin(projects, eq(projects.id, testimonials.projectId))
		.orderBy(desc(testimonials.createdAt))
});

export const actions: Actions = {
	toggle: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		const [row] = await locals.db
			.update(testimonials)
			.set({ isPublished: sql`not ${testimonials.isPublished}` })
			.where(eq(testimonials.id, id))
			.returning({ p: testimonials.isPublished });
		return { message: row?.p ? 'Review gepubliceerd.' : 'Review verborgen.' };
	},
	delete: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		await locals.db.delete(testimonials).where(eq(testimonials.id, id));
		return { message: 'Review verwijderd.' };
	}
};
