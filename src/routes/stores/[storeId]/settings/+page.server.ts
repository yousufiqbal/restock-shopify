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
	default: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const apiToken = data.get('apiToken')?.toString().trim() ?? '';
		const airLeadDays = parseInt(data.get('airLeadDays')?.toString() ?? '15', 10);
		const seaLeadDays = parseInt(data.get('seaLeadDays')?.toString() ?? '60', 10);

		if (!name) return fail(400, { error: 'Name required' });

		const updates: Record<string, unknown> = { name, airLeadDays, seaLeadDays };
		if (apiToken) updates.apiToken = apiToken;

		await db.update(stores).set(updates).where(eq(stores.id, params.storeId));
		redirect(302, '/stores');
	}
};
