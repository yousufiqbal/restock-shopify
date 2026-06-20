import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/auth/login');
	if (!(locals.user as any).twoFactorEnabled) redirect(302, '/auth/setup-2fa');
	if ((locals.session as any)?.twoFactorVerified) redirect(302, '/stores');
	return {};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString() ?? '';

		const res = await fetch('/api/auth/two-factor/verify-totp', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ code })
		});

		if (!res.ok) {
			return fail(400, { error: 'Invalid code. Try again.' });
		}

		redirect(302, '/stores');
	}
};
