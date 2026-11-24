import { redirect } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth';
import { serverEnv } from '$lib/server/env';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => redirect(303, '/admin');

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		await destroySession(locals.db, cookies.get(SESSION_COOKIE), serverEnv.authSecret, cookies);
		redirect(303, '/admin/login');
	}
};
