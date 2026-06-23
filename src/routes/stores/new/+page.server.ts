import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const storeType = data.get('storeType')?.toString() ?? 'shopify';
		const name = data.get('name')?.toString().trim() ?? '';
		const airLeadDays = parseInt(data.get('airLeadDays')?.toString() ?? '15', 10);
		const seaLeadDays = parseInt(data.get('seaLeadDays')?.toString() ?? '60', 10);

		if (!name) return fail(400, { error: 'Store name is required' });

		if (storeType === 'amazon') {
			const domain = data.get('sellerId')?.toString().trim() ?? '';
			const marketplaceId = data.get('marketplaceId')?.toString().trim() ?? '';
			const lwaClientId = data.get('lwaClientId')?.toString().trim() ?? '';
			const lwaClientSecret = data.get('lwaClientSecret')?.toString().trim() ?? '';
			const lwaRefreshToken = data.get('lwaRefreshToken')?.toString().trim() ?? '';

			if (!domain || !marketplaceId || !lwaClientId || !lwaClientSecret || !lwaRefreshToken) {
				return fail(400, { error: 'All Amazon fields are required' });
			}

			try {
				await db.insert(stores).values({
					storeType: 'amazon',
					name,
					domain,
					apiToken: '',
					airLeadDays,
					seaLeadDays,
					marketplaceId,
					lwaClientId,
					lwaClientSecret,
					lwaRefreshToken
				});
			} catch {
				return fail(400, { error: 'A store with this Seller ID already exists' });
			}
		} else {
			const domain = data
				.get('domain')
				?.toString()
				.trim()
				.toLowerCase()
				.replace(/https?:\/\//, '')
				.replace(/\/$/, '') ?? '';
			const apiToken = data.get('apiToken')?.toString().trim() ?? '';

			if (!domain || !apiToken) return fail(400, { error: 'All fields required' });

			try {
				await db.insert(stores).values({ storeType: 'shopify', name, domain, apiToken, airLeadDays, seaLeadDays });
			} catch {
				return fail(400, { error: 'A store with this domain already exists' });
			}
		}

		redirect(302, '/stores');
	}
};
