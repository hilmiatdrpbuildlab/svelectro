import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { INQUIRY_STATUSES, type InquiryStatus } from '$lib/content';
import { inquiries } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isUuid(params.id)) error(404, 'Aanvraag niet gevonden');
	const [inquiry] = await locals.db.select().from(inquiries).where(eq(inquiries.id, params.id));
	if (!inquiry) error(404, 'Aanvraag niet gevonden');
	const { attachmentKey, ...rest } = inquiry;
	return {
		inquiry: {
			...rest,
			attachment: attachmentKey
				? {
						href: `/admin/files/${attachmentKey}?name=${encodeURIComponent(inquiry.attachmentName ?? '')}`,
						isImage: /\.(jpg|png|webp)$/.test(attachmentKey),
						name: inquiry.attachmentName ?? attachmentKey.split('/').pop()
					}
				: null
		}
	};
};

export const actions: Actions = {
	status: async ({ request, params, locals }) => {
		const status = String((await request.formData()).get('status'));
		if (!INQUIRY_STATUSES.some((s) => s.value === status)) return fail(400, { error: 'Ongeldige status.' });
		await locals.db
			.update(inquiries)
			.set({ status: status as InquiryStatus })
			.where(eq(inquiries.id, params.id));
		return { message: 'Status bijgewerkt.' };
	},
	delete: async ({ params, locals }) => {
		if (!isUuid(params.id)) error(404, 'Aanvraag niet gevonden');
		const [row] = await locals.db.delete(inquiries).where(eq(inquiries.id, params.id)).returning();
		if (row?.attachmentKey) await locals.storage().delete('private', row.attachmentKey);
		redirect(303, '/admin/inquiries');
	}
};
