import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Already has a full session => 2FA already done
	if (locals.user) redirect(302, '/stores');
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString() ?? '';

		try {
			await (auth.api as any).verifyTOTP({
				headers: request.headers,
				body: { code }
			});
		} catch (e: any) {
			return fail(400, { error: 'Invalid code. Try again.' });
		}

		redirect(302, '/stores');
	}
};
