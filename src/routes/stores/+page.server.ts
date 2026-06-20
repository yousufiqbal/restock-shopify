import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allStores = await db.select().from(stores).orderBy(stores.createdAt);
	return { stores: allStores };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const domain = data.get('domain')?.toString().trim().toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '') ?? '';
		const apiToken = data.get('apiToken')?.toString().trim() ?? '';
		const airLeadDays = parseInt(data.get('airLeadDays')?.toString() ?? '15', 10);
		const seaLeadDays = parseInt(data.get('seaLeadDays')?.toString() ?? '60', 10);

		if (!name || !domain || !apiToken) return fail(400, { error: 'All fields required' });

		try {
			await db.insert(stores).values({ name, domain, apiToken, airLeadDays, seaLeadDays });
		} catch {
			return fail(400, { error: 'Store with this domain already exists' });
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString() ?? '';
		if (id) await db.delete(stores).where(eq(stores.id, id));
		return { success: true };
	}
};
