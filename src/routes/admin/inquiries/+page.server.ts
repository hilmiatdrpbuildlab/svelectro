import { count, desc, eq } from 'drizzle-orm';
import { INQUIRY_STATUSES, type InquiryStatus } from '$lib/content';
import { inquiries } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ locals, url }) => {
	const s = url.searchParams.get('status');
	const status = INQUIRY_STATUSES.some((x) => x.value === s) ? (s as InquiryStatus) : null;
	const pageNo = Math.max(1, Number(url.searchParams.get('p')) || 1);
	const where = status ? eq(inquiries.status, status) : undefined;
	const db = locals.db;

	const [rows, [total], perStatus] = await db.batch([
		db
			.select({
				id: inquiries.id,
				fullName: inquiries.fullName,
				email: inquiries.email,
				phone: inquiries.phone,
				city: inquiries.city,
				serviceType: inquiries.serviceType,
				message: inquiries.message,
				status: inquiries.status,
				attachmentKey: inquiries.attachmentKey,
				createdAt: inquiries.createdAt
			})
			.from(inquiries)
			.where(where)
			.orderBy(desc(inquiries.createdAt))
			.limit(PAGE_SIZE)
			.offset((pageNo - 1) * PAGE_SIZE),
		db.select({ n: count() }).from(inquiries).where(where),
		db.select({ status: inquiries.status, n: count() }).from(inquiries).groupBy(inquiries.status)
	]);

	return {
		inquiries: rows.map(({ attachmentKey, message, ...r }) => ({
			...r,
			hasAttachment: !!attachmentKey,
			excerpt: message.slice(0, 160)
		})),
		status,
		page: pageNo,
		pages: Math.max(1, Math.ceil(total.n / PAGE_SIZE)),
		counts: Object.fromEntries(perStatus.map((r) => [r.status, r.n])) as Record<string, number>
	};
};
