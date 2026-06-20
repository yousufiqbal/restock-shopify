import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import QRCode from 'qrcode';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/auth/login');
	if ((locals.user as any).twoFactorEnabled) redirect(302, '/stores');
	return {};
};

export const actions: Actions = {
	generate: async ({ request, fetch }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString() ?? '';

		const res = await fetch('/api/auth/two-factor/enable', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ password })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(400, { error: err.message || 'Incorrect password.' });
		}

		const data = await res.json();
		const totpUri: string = data.totpURI;
		const backupCodes: string[] = data.backupCodes ?? [];
		const qrCode = await QRCode.toDataURL(totpUri);

		return { step: 'verify' as const, totpUri, qrCode, backupCodes };
	},

	confirm: async ({ request, fetch }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString() ?? '';
		const totpUri = formData.get('totpUri')?.toString() ?? '';
		const backupCodes = JSON.parse(formData.get('backupCodes')?.toString() ?? '[]');

		const res = await fetch('/api/auth/two-factor/verify-totp', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ code })
		});

		if (!res.ok) {
			const qrCode = await QRCode.toDataURL(totpUri);
			return fail(400, { step: 'verify' as const, error: 'Invalid code. Try again.', totpUri, qrCode, backupCodes });
		}

		redirect(302, '/stores');
	}
};
