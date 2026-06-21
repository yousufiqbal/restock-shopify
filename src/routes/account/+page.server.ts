import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
	if (!event.locals.user) redirect(302, '/auth/login');
	return { user: event.locals.user };
};

export const actions: Actions = {
	changePassword: async (event) => {
		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword) {
			return fail(400, { error: 'All fields are required' });
		}
		if (newPassword.length < 8) {
			return fail(400, { error: 'New password must be at least 8 characters' });
		}
		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword, revokeOtherSessions: true },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Could not change password' });
			}
			return fail(500, { error: 'Unexpected error' });
		}

		return { success: true };
	}
};
