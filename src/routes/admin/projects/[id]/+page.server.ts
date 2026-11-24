import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { PROJECT_CATEGORIES } from '$lib/content';
import { runBatch } from '$lib/server/db';
import { projectImages, projects } from '$lib/server/db/schema';
import { storeImage } from '$lib/server/media';
import { uniqueSlug } from '$lib/server/slug';
import type { Actions, PageServerLoad } from './$types';

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export const load: PageServerLoad = async ({ params, locals }) => {
	if (params.id === 'new') return { project: null, images: [] };
	if (!isUuid(params.id)) error(404, 'Project niet gevonden');
	const db = locals.db;
	const [[project], images] = await db.batch([
		db.select().from(projects).where(eq(projects.id, params.id)),
		db.select().from(projectImages).where(eq(projectImages.projectId, params.id)).orderBy(asc(projectImages.sortOrder))
	]);
	if (!project) error(404, 'Project niet gevonden');
	return { project, images };
};

const schema = z.object({
	title: z.string().trim().min(2, 'Geef een titel op.').max(160),
	slug: z.string().trim().max(100),
	category: z.enum(PROJECT_CATEGORIES, { message: 'Kies een categorie.' }),
	location: z.string().trim().max(120),
	clientType: z.string().trim().max(60),
	summary: z.string().trim().max(400),
	description: z.string().trim().max(8000),
	completionDate: z
		.string()
		.trim()
		.refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Ongeldige datum.'),
	featured: z.boolean()
});

async function requireProject(locals: App.Locals, id: string) {
	if (!isUuid(id)) error(404, 'Project niet gevonden');
	const [p] = await locals.db.select({ id: projects.id }).from(projects).where(eq(projects.id, id));
	if (!p) error(404, 'Project niet gevonden');
	return p;
}

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await request.formData();
		const raw = Object.fromEntries(
			['title', 'slug', 'category', 'location', 'clientType', 'summary', 'description', 'completionDate'].map((k) => [
				k,
				String(form.get(k) ?? '')
			])
		);
		const parsed = schema.safeParse({ ...raw, featured: form.get('featured') === 'on' });
		if (!parsed.success) {
			const errors = Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]));
			return fail(400, { error: 'Controleer de gemarkeerde velden.', errors, values: raw });
		}
		const d = parsed.data;
		const db = locals.db;
		const isNew = params.id === 'new';
		const slug = await uniqueSlug(db, projects, d.slug || d.title, isNew ? undefined : params.id);
		const values = {
			title: d.title,
			slug,
			category: d.category,
			location: d.location || null,
			clientType: d.clientType || null,
			summary: d.summary,
			description: d.description,
			completionDate: d.completionDate || null,
			featured: d.featured
		};

		if (isNew) {
			const [{ n }] = await db.select({ n: max(projects.sortOrder) }).from(projects);
			const [row] = await db
				.insert(projects)
				.values({ ...values, sortOrder: (n ?? -1) + 1 })
				.returning({ id: projects.id });
			redirect(303, `/admin/projects/${row.id}?created=1`);
		}
		await requireProject(locals, params.id);
		await db.update(projects).set(values).where(eq(projects.id, params.id));
		return { message: 'Project opgeslagen.' };
	},

	upload: async ({ request, params, locals }) => {
		await requireProject(locals, params.id);
		const form = await request.formData();
		const files = form.getAll('images');
		const thumbs = form.getAll('images_thumb');
		const ws = form.getAll('images_w');
		const hs = form.getAll('images_h');
		if (!files.some((f) => f instanceof File && f.size > 0)) return fail(400, { error: 'Kies minstens één foto.' });
		if (files.length > 30) return fail(400, { error: 'Upload maximaal 30 foto’s tegelijk.' });

		const db = locals.db;
		const existing = await db
			.select({ isCover: projectImages.isCover, sortOrder: projectImages.sortOrder })
			.from(projectImages)
			.where(eq(projectImages.projectId, params.id));
		let order = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1) + 1;
		let hasCover = existing.some((r) => r.isCover);

		const errors: string[] = [];
		let added = 0;
		for (let i = 0; i < files.length; i++) {
			const res = await storeImage(locals.storage(), files[i], thumbs[i] ?? null, 'projects', {
				w: ws[i] ?? null,
				h: hs[i] ?? null
			}).catch((e) => {
				console.error('project image upload failed', e);
				return { ok: false as const, error: 'opslag tijdelijk niet bereikbaar, probeer opnieuw.' };
			});
			if (!res) continue;
			if (!res.ok) {
				errors.push(`${(files[i] as File).name}: ${res.error}`);
				continue;
			}
			const im = res.image;
			await db.insert(projectImages).values({
				projectId: params.id,
				imageUrl: im.url,
				storageKey: im.key,
				thumbUrl: im.thumbUrl,
				thumbKey: im.thumbKey,
				width: im.width,
				height: im.height,
				isCover: !hasCover,
				sortOrder: order++
			});
			hasCover = true;
			added++;
		}
		if (errors.length && !added) return fail(400, { error: errors.join(' ') });
		return {
			message: `${added} foto${added === 1 ? '' : "'s"} toegevoegd.${errors.length ? ` Overgeslagen: ${errors.join(' ')}` : ''}`
		};
	},

	/** Captions + order, from the photo grid (ids in display order). */
	saveImages: async ({ request, params, locals }) => {
		await requireProject(locals, params.id);
		const form = await request.formData();
		const ids = form.getAll('imageId').map(String);
		const db = locals.db;
		await runBatch(
			db,
			ids.map((id, i) =>
				db
					.update(projectImages)
					.set({ sortOrder: i, caption: String(form.get(`caption_${id}`) ?? '').trim().slice(0, 300) })
					.where(and(eq(projectImages.id, id), eq(projectImages.projectId, params.id)))
			)
		);
		return { message: 'Foto’s opgeslagen.' };
	},

	setCover: async ({ request, params, locals }) => {
		await requireProject(locals, params.id);
		const id = String((await request.formData()).get('targetId'));
		const db = locals.db;
		await db.batch([
			db.update(projectImages).set({ isCover: false }).where(eq(projectImages.projectId, params.id)),
			db
				.update(projectImages)
				.set({ isCover: true })
				.where(and(eq(projectImages.id, id), eq(projectImages.projectId, params.id)))
		]);
		return { message: 'Omslagfoto ingesteld.' };
	},

	deleteImage: async ({ request, params, locals }) => {
		await requireProject(locals, params.id);
		const id = String((await request.formData()).get('targetId'));
		const db = locals.db;
		const [img] = await db
			.delete(projectImages)
			.where(and(eq(projectImages.id, id), eq(projectImages.projectId, params.id)))
			.returning();
		if (!img) return fail(404, { error: 'Foto niet gevonden.' });
		await locals.storage().delete('public', img.storageKey, img.thumbKey);
		if (img.isCover) {
			const [next] = await db
				.select({ id: projectImages.id })
				.from(projectImages)
				.where(eq(projectImages.projectId, params.id))
				.orderBy(asc(projectImages.sortOrder))
				.limit(1);
			if (next) await db.update(projectImages).set({ isCover: true }).where(eq(projectImages.id, next.id));
		}
		return { message: 'Foto verwijderd.' };
	},

	delete: async ({ params, locals }) => {
		await requireProject(locals, params.id);
		const db = locals.db;
		const imgs = await db
			.select({ a: projectImages.storageKey, b: projectImages.thumbKey })
			.from(projectImages)
			.where(eq(projectImages.projectId, params.id));
		await db.delete(projects).where(eq(projects.id, params.id)); // images cascade
		await locals.storage().delete('public', ...imgs.flatMap((r) => [r.a, r.b]));
		redirect(303, '/admin/projects?deleted=1');
	}
};
