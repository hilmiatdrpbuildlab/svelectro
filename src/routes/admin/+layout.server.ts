import { count, eq } from 'drizzle-orm';
import { inquiries } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { user: null, unread: 0 };
	const [row] = await locals.db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, 'new'));
	return { user: locals.user, unread: row?.n ?? 0 };
};
