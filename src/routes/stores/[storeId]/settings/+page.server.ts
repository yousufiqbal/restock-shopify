import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404, 'Store not found');
	return { store };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
		if (!store) error(404);

		const name = data.get('name')?.toString().trim() ?? '';
		const airLeadDays = parseInt(data.get('airLeadDays')?.toString() ?? '15', 10);
		const seaLeadDays = parseInt(data.get('seaLeadDays')?.toString() ?? '60', 10);

		if (!name) return fail(400, { error: 'Name required' });

		const updates: Record<string, unknown> = { name, airLeadDays, seaLeadDays };

		if (store.storeType === 'amazon') {
			const lwaClientId = data.get('lwaClientId')?.toString().trim();
			const lwaClientSecret = data.get('lwaClientSecret')?.toString().trim();
			const lwaRefreshToken = data.get('lwaRefreshToken')?.toString().trim();
			const marketplaceId = data.get('marketplaceId')?.toString().trim();
			if (lwaClientId) updates.lwaClientId = lwaClientId;
			if (lwaClientSecret) updates.lwaClientSecret = lwaClientSecret;
			if (lwaRefreshToken) updates.lwaRefreshToken = lwaRefreshToken;
			if (marketplaceId) updates.marketplaceId = marketplaceId;
		} else {
			const apiToken = data.get('apiToken')?.toString().trim();
			if (apiToken) updates.apiToken = apiToken;
		}

		await db.update(stores).set(updates).where(eq(stores.id, params.storeId));
		redirect(302, '/stores');
	},

	delete: async ({ params }) => {
		await db.delete(stores).where(eq(stores.id, params.storeId));
		redirect(302, '/stores');
	}
};
