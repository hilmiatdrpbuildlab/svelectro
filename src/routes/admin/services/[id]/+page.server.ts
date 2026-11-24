import { error, fail, redirect } from '@sveltejs/kit';
import { eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { ICON_NAMES } from '$lib/content';
import { services } from '$lib/server/db/schema';
import { storeImage } from '$lib/server/media';
import { uniqueSlug } from '$lib/server/slug';
import type { Actions, PageServerLoad } from './$types';

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export const load: PageServerLoad = async ({ params, locals }) => {
	if (params.id === 'new') return { service: null };
	if (!isUuid(params.id)) error(404, 'Dienst niet gevonden');
	const [service] = await locals.db.select().from(services).where(eq(services.id, params.id));
	if (!service) error(404, 'Dienst niet gevonden');
	return { service };
};

const schema = z.object({
	title: z.string().trim().min(2, 'Geef een titel op.').max(120),
	slug: z.string().trim().max(100),
	shortDescription: z.string().trim().min(10, 'Schrijf een korte omschrijving (min. 10 tekens).').max(300),
	fullDescription: z.string().trim().max(8000),
	iconName: z.enum(ICON_NAMES),
	isActive: z.boolean()
});

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await request.formData();
		const raw = Object.fromEntries(
			['title', 'slug', 'shortDescription', 'fullDescription', 'iconName'].map((k) => [k, String(form.get(k) ?? '')])
		);
		const parsed = schema.safeParse({ ...raw, isActive: form.get('isActive') === 'on' });
		if (!parsed.success) {
			const errors = Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]));
			return fail(400, { error: 'Controleer de gemarkeerde velden.', errors, values: raw });
		}
		const d = parsed.data;
		const db = locals.db;
		const isNew = params.id === 'new';

		let existing: typeof services.$inferSelect | undefined;
		if (!isNew) {
			if (!isUuid(params.id)) error(404, 'Dienst niet gevonden');
			[existing] = await db.select().from(services).where(eq(services.id, params.id));
			if (!existing) error(404, 'Dienst niet gevonden');
		}

		const img = await storeImage(locals.storage(), form.get('cover'), null, 'services');
		if (img && !img.ok) return fail(400, { error: img.error, errors: { cover: img.error }, values: raw });

		const values: Partial<typeof services.$inferInsert> = {
			title: d.title,
			slug: await uniqueSlug(db, services, d.slug || d.title, existing?.id),
			shortDescription: d.shortDescription,
			fullDescription: d.fullDescription,
			iconName: d.iconName,
			isActive: d.isActive
		};
		const oldKey = existing?.coverImageKey;
		if (img?.ok) {
			values.coverImageUrl = img.image.url;
			values.coverImageKey = img.image.key;
		} else if (form.get('cover_remove') === 'on') {
			values.coverImageUrl = null;
			values.coverImageKey = null;
		}

		if (isNew) {
			const [{ n }] = await db.select({ n: max(services.sortOrder) }).from(services);
			const [row] = await db
				.insert(services)
				.values({ ...(values as typeof services.$inferInsert), sortOrder: (n ?? -1) + 1 })
				.returning({ id: services.id });
			redirect(303, `/admin/services/${row.id}?created=1`);
		}

		await db.update(services).set(values).where(eq(services.id, params.id));
		// Replaced or removed cover: clean the old object from the bucket.
		if (oldKey && 'coverImageKey' in values && values.coverImageKey !== oldKey)
			await locals.storage().delete('public', oldKey);
		return { message: 'Dienst opgeslagen.' };
	},

	delete: async ({ params, locals }) => {
		if (!isUuid(params.id)) error(404, 'Dienst niet gevonden');
		const [row] = await locals.db.delete(services).where(eq(services.id, params.id)).returning();
		if (row?.coverImageKey) await locals.storage().delete('public', row.coverImageKey);
		redirect(303, '/admin/services');
	}
};
