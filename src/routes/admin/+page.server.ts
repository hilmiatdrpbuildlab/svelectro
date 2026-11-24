import { count, desc, eq } from 'drizzle-orm';
import { inquiries, projects, services, testimonials } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;
	const [[p], [s], [i], [t], recent] = await db.batch([
		db.select({ n: count() }).from(projects),
		db.select({ n: count() }).from(services).where(eq(services.isActive, true)),
		db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, 'new')),
		db.select({ n: count() }).from(testimonials).where(eq(testimonials.isPublished, true)),
		db
			.select({
				id: inquiries.id,
				fullName: inquiries.fullName,
				city: inquiries.city,
				serviceType: inquiries.serviceType,
				status: inquiries.status,
				createdAt: inquiries.createdAt,
				hasAttachment: inquiries.attachmentKey
			})
			.from(inquiries)
			.orderBy(desc(inquiries.createdAt))
			.limit(6)
	]);
	return {
		stats: { projects: p.n, services: s.n, unread: i.n, testimonials: t.n },
		recent: recent.map((r) => ({ ...r, hasAttachment: !!r.hasAttachment }))
	};
};
