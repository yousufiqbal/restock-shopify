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
		const name = data.get('name')?.toString().trim() ?? '';
		const apiToken = data.get('apiToken')?.toString().trim() ?? '';
		const airLeadDays = parseInt(data.get('airLeadDays')?.toString() ?? '15', 10);
		const seaLeadDays = parseInt(data.get('seaLeadDays')?.toString() ?? '60', 10);

		if (!name) return fail(400, { error: 'Name required' });

		const oauthClientId = data.get('oauthClientId')?.toString().trim() || null;
		const oauthClientSecret = data.get('oauthClientSecret')?.toString().trim() || null;
		const oauthRedirectUri = data.get('oauthRedirectUri')?.toString().trim() || null;

		const updates: Record<string, unknown> = {
			name, airLeadDays, seaLeadDays,
			oauthClientId, oauthClientSecret, oauthRedirectUri
		};
		if (apiToken) updates.apiToken = apiToken;

		await db.update(stores).set(updates).where(eq(stores.id, params.storeId));
		return { saved: true };
	},

	exchangeToken: async ({ request, params }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString().trim() ?? '';
		if (!code) return fail(400, { tokenError: 'Code is required' });

		const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
		if (!store) error(404);
		if (!store.oauthClientId || !store.oauthClientSecret)
			return fail(400, { tokenError: 'Save Client ID and Client Secret first' });

		const res = await fetch(`https://${store.domain}/admin/oauth/access_token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ client_id: store.oauthClientId, client_secret: store.oauthClientSecret, code })
		});

		const json = await res.json() as { access_token?: string; error_description?: string; error?: string };
		if (!json.access_token)
			return fail(422, { tokenError: json.error_description ?? json.error ?? `Exchange failed: ${res.status}` });

		await db.update(stores).set({ apiToken: json.access_token }).where(eq(stores.id, params.storeId));
		return { tokenSaved: true };
	},

	delete: async ({ params }) => {
		await db.delete(stores).where(eq(stores.id, params.storeId));
		redirect(302, '/stores');
	}
};
