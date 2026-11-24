import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { createSession, purgeExpiredSessions } from '$lib/server/auth';
import { adminUsers } from '$lib/server/db/schema';
import { serverEnv } from '$lib/server/env';
import { burnPasswordCheck, verifyPassword } from '$lib/server/password';
import { clearEvents, clientKey, isLimited, recordEvent } from '$lib/server/ratelimit';
import type { Actions, PageServerLoad } from './$types';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;

const safeNext = (v: string | null) => (v && v.startsWith('/admin') && !v.startsWith('//') ? v : '/admin');

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const db = locals.db;

		const ipKey = await clientKey(getClientAddress(), serverEnv.authSecret);
		const emailKey = await clientKey(`email:${email}`, serverEnv.authSecret);
		if (
			(await isLimited(db, 'login', ipKey, MAX_FAILURES * 2, WINDOW_MS)) ||
			(await isLimited(db, 'login', emailKey, MAX_FAILURES, WINDOW_MS))
		) {
			return fail(429, { email, error: 'Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.' });
		}

		if (!email || !password) return fail(400, { email, error: 'Vul uw e-mailadres en wachtwoord in.' });

		const [user] = await db
			.select()
			.from(adminUsers)
			.where(sql`lower(${adminUsers.email}) = ${email}`)
			.limit(1);

		const valid = user ? await verifyPassword(password, user.passwordHash) : (await burnPasswordCheck(password), false);
		if (!user || !valid) {
			await recordEvent(db, 'login', ipKey);
			await recordEvent(db, 'login', emailKey);
			return fail(400, { email, error: 'E-mailadres of wachtwoord is onjuist.' });
		}

		await clearEvents(db, 'login', emailKey);
		await purgeExpiredSessions(db);
		await createSession(db, user.id, serverEnv.authSecret, cookies, url.protocol === 'https:');
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
