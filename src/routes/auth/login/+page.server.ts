import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) redirect(302, '/stores');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		let result: any;
		try {
			result = await auth.api.signInEmail({ body: { email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Invalid email or password' });
			}
			return fail(500, { error: 'Unexpected error' });
		}

		// 2FA enabled: signInEmail destroys the session and sets a temp 2FA cookie
		if (result?.twoFactorRedirect) redirect(302, '/auth/verify-2fa');

		redirect(302, '/stores');
	}
};
