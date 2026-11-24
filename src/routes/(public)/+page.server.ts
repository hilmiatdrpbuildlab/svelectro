import { fail } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { inquiries, projectImages, projects, services, testimonials } from '$lib/server/db/schema';
import { serverEnv } from '$lib/server/env';
import { ATTACHMENT_MAX_BYTES, readUpload } from '$lib/server/files';
import { clientKey, isLimited, recordEvent } from '$lib/server/ratelimit';
import { newKey } from '$lib/server/storage';
import { t } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;
	const [serviceRows, projectRows, imageRows, reviewRows] = await db.batch([
		db
			.select({
				id: services.id,
				title: services.title,
				slug: services.slug,
				shortDescription: services.shortDescription,
				fullDescription: services.fullDescription,
				iconName: services.iconName,
				coverImageUrl: services.coverImageUrl
			})
			.from(services)
			.where(eq(services.isActive, true))
			.orderBy(asc(services.sortOrder), asc(services.createdAt)),
		db.select().from(projects).orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt)),
		db
			.select({
				id: projectImages.id,
				projectId: projectImages.projectId,
				imageUrl: projectImages.imageUrl,
				thumbUrl: projectImages.thumbUrl,
				width: projectImages.width,
				height: projectImages.height,
				caption: projectImages.caption,
				isCover: projectImages.isCover
			})
			.from(projectImages)
			.orderBy(desc(projectImages.isCover), asc(projectImages.sortOrder)),
		db
			.select({
				id: testimonials.id,
				clientName: testimonials.clientName,
				companyOrCity: testimonials.companyOrCity,
				rating: testimonials.rating,
				quote: testimonials.quote,
				projectId: testimonials.projectId
			})
			.from(testimonials)
			.where(eq(testimonials.isPublished, true))
			.orderBy(desc(testimonials.createdAt))
	]);

	const projectList = projectRows
		.map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			category: p.category,
			location: p.location,
			clientType: p.clientType,
			summary: p.summary,
			description: p.description,
			completionDate: p.completionDate,
			featured: p.featured,
			images: imageRows.filter((i) => i.projectId === p.id)
		}))
		.filter((p) => p.images.length > 0);

	const projectTitle = new Map(projectRows.map((p) => [p.id, { title: p.title, category: p.category }]));

	return {
		services: serviceRows,
		projects: projectList,
		testimonials: reviewRows.map((r) => ({ ...r, project: r.projectId ? (projectTitle.get(r.projectId) ?? null) : null }))
	};
};

// Messages match the client-side checks in Contact.svelte (via the i18n keys contact.err.*).
const quoteSchema = z
	.object({
		fullName: z.string().trim().min(2, t('contact.err.name')).max(120),
		email: z
			.string()
			.trim()
			.toLowerCase()
			.max(200)
			.refine((v) => v === '' || z.email().safeParse(v).success, t('contact.err.email')),
		phone: z
			.string()
			.trim()
			.max(40)
			.refine((v) => v === '' || /^[+0-9 ()./-]{8,}$/.test(v), t('contact.err.phone')),
		city: z.string().trim().max(120),
		serviceType: z.string().trim().max(120),
		message: z.string().trim().min(10, t('contact.err.message')).max(5000)
	})
	// The owner follows up by phone or e-mail: one of the two is enough.
	.refine((d) => d.email !== '' || d.phone !== '', { path: ['email'], message: t('contact.err.reach') });

export type QuoteField = keyof z.infer<typeof quoteSchema> | 'attachment' | 'form';

export const actions: Actions = {
	quote: async ({ request, locals, getClientAddress }) => {
		const form = await request.formData();
		const values = {
			fullName: String(form.get('fullName') ?? ''),
			email: String(form.get('email') ?? ''),
			phone: String(form.get('phone') ?? ''),
			city: String(form.get('city') ?? ''),
			serviceType: String(form.get('serviceType') ?? ''),
			message: String(form.get('message') ?? '')
		};

		// Honeypot: real visitors never see or fill this field. Pretend success to bots.
		if (String(form.get('website') ?? '') !== '') return { success: true };

		const parsed = quoteSchema.safeParse(values);
		const errors: Partial<Record<QuoteField, string>> = {};
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const k = issue.path[0] as QuoteField;
				errors[k] ??= issue.message;
			}
		}

		const upload = await readUpload(form.get('attachment'), {
			maxBytes: ATTACHMENT_MAX_BYTES,
			allowPdf: true,
			label: 'De bijlage'
		});
		if (upload && !upload.ok) errors.attachment = upload.error;

		if (!parsed.success || Object.keys(errors).length) return fail(400, { values, errors });

		const db = locals.db;
		const key = await clientKey(getClientAddress(), serverEnv.authSecret);
		if (await isLimited(db, 'quote', key, 5, 10 * 60_000))
			return fail(429, {
				values,
				errors: { form: t('contact.err.rateLimit') }
			});

		// A lead is never lost to a storage hiccup: if the attachment cannot be stored, the inquiry
		// is still saved (with a note) and the visitor is asked to e-mail the file.
		let attachmentKey: string | null = null;
		let attachmentName: string | null = null;
		let attachmentFailed = false;
		if (upload?.ok) {
			const original = form.get('attachment') as File;
			attachmentName = original.name.slice(0, 200) || `bijlage.${upload.type.ext}`;
			try {
				attachmentKey = newKey('inquiries', upload.type.ext);
				await locals.storage().put('private', attachmentKey, upload.bytes, upload.type.mime);
			} catch (e) {
				console.error('quote attachment upload failed', e);
				attachmentKey = null;
				attachmentFailed = true;
			}
		}

		const d = parsed.data;
		await db.insert(inquiries).values({
			fullName: d.fullName,
			email: d.email,
			phone: d.phone || null,
			city: d.city || null,
			serviceType: d.serviceType || null,
			message: attachmentFailed
				? `${d.message}\n\n[Bijlage “${attachmentName}” kon niet worden opgeslagen. De klant werd gevraagd ze te mailen.]`
				: d.message,
			attachmentKey,
			attachmentName: attachmentKey ? attachmentName : null,
			attachmentUrl: attachmentKey ? `/admin/files/${attachmentKey}` : null
		});
		await recordEvent(db, 'quote', key);

		return { success: true, attachmentFailed, firstName: d.fullName.split(/\s+/)[0].slice(0, 40) };
	}
};
