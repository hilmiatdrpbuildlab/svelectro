import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { projects, testimonials } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export const load: PageServerLoad = async ({ params, locals }) => {
	const projectOptions = await locals.db
		.select({ id: projects.id, title: projects.title })
		.from(projects)
		.orderBy(asc(projects.title));
	if (params.id === 'new') return { testimonial: null, projectOptions };
	if (!isUuid(params.id)) error(404, 'Review niet gevonden');
	const [testimonial] = await locals.db.select().from(testimonials).where(eq(testimonials.id, params.id));
	if (!testimonial) error(404, 'Review niet gevonden');
	return { testimonial, projectOptions };
};

const schema = z.object({
	clientName: z.string().trim().min(2, 'Geef de naam van de klant op.').max(120),
	companyOrCity: z.string().trim().max(120),
	rating: z.coerce.number().int().min(1).max(5),
	quote: z.string().trim().min(10, 'De review is te kort.').max(1500),
	projectId: z.string().refine((v) => v === '' || isUuid(v)),
	isPublished: z.boolean()
});

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await request.formData();
		const raw = Object.fromEntries(
			['clientName', 'companyOrCity', 'rating', 'quote', 'projectId'].map((k) => [k, String(form.get(k) ?? '')])
		);
		const parsed = schema.safeParse({ ...raw, isPublished: form.get('isPublished') === 'on' });
		if (!parsed.success) {
			const errors = Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]));
			return fail(400, { error: 'Controleer de gemarkeerde velden.', errors, values: raw });
		}
		const d = parsed.data;
		const values = {
			clientName: d.clientName,
			companyOrCity: d.companyOrCity || null,
			rating: d.rating,
			quote: d.quote,
			projectId: d.projectId || null,
			isPublished: d.isPublished
		};
		if (params.id === 'new') {
			await locals.db.insert(testimonials).values(values);
		} else {
			if (!isUuid(params.id)) error(404, 'Review niet gevonden');
			await locals.db.update(testimonials).set(values).where(eq(testimonials.id, params.id));
		}
		redirect(303, '/admin/testimonials');
	}
};
