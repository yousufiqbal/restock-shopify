import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import QRCode from 'qrcode';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/auth/login');
	if ((locals.user as any).twoFactorEnabled) redirect(302, '/stores');
	return {};
};

export const actions: Actions = {
	generate: async ({ request, locals }) => {
		if ((locals.user as any)?.twoFactorEnabled) return fail(403, { error: '2FA already enabled.' });

		const formData = await request.formData();
		const password = formData.get('password')?.toString() ?? '';

		let result: any;
		try {
			result = await (auth.api as any).enableTwoFactor({
				headers: request.headers,
				body: { password }
			});
		} catch (e: any) {
			return fail(400, { error: e?.body?.message ?? e?.message ?? 'Incorrect password.' });
		}

		const totpUri: string = result?.totpURI ?? result?.totpUri ?? '';
		const backupCodes: string[] = result?.backupCodes ?? [];
		const qrCode = await QRCode.toDataURL(totpUri);

		return { step: 'verify' as const, totpUri, qrCode, backupCodes };
	},

	confirm: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString() ?? '';
		const totpUri = formData.get('totpUri')?.toString() ?? '';
		const backupCodes = JSON.parse(formData.get('backupCodes')?.toString() ?? '[]');

		try {
			await (auth.api as any).verifyTOTP({
				headers: request.headers,
				body: { code }
			});
		} catch (e: any) {
			const qrCode = await QRCode.toDataURL(totpUri);
			return fail(400, { step: 'verify' as const, error: 'Invalid code. Try again.', totpUri, qrCode, backupCodes });
		}

		redirect(302, '/stores');
	}
};
