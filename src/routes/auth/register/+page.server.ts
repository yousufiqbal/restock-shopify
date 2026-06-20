import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/stores');
	const existing = await db.select({ id: user.id }).from(user).limit(1);
	if (existing.length > 0) redirect(302, '/auth/login');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const existing = await db.select({ id: user.id }).from(user).limit(1);
		if (existing.length > 0) return fail(403, { error: 'Registration is closed.' });

		const formData = await event.request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Registration failed' });
			}
			return fail(500, { error: 'Unexpected error' });
		}

		redirect(302, '/stores');
	}
};
