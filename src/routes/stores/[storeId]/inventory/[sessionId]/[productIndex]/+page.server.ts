import { db } from '$lib/server/db';
import { stores, inventorySessions, inventoryItems } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const index = parseInt(params.productIndex, 10);
	if (isNaN(index) || index < 0) redirect(302, `../${params.sessionId}/0`);

	const [[store], [session], variants] = await Promise.all([
		db.select().from(stores).where(eq(stores.id, params.storeId)),
		db.select().from(inventorySessions).where(
			and(eq(inventorySessions.id, params.sessionId), eq(inventorySessions.storeId, params.storeId))
		),
		db.select().from(inventoryItems).where(
			and(eq(inventoryItems.sessionId, params.sessionId), eq(inventoryItems.position, index))
		).orderBy(asc(inventoryItems.variantPosition))
	]);

	if (!store) error(404, 'Store not found');
	if (!session) error(404, 'Session not found');

	const totalProducts = session.totalProducts;
	if (index >= totalProducts || variants.length === 0) {
		redirect(302, `/stores/${params.storeId}/inventory/${params.sessionId}/complete`);
	}

	return {
		store,
		session,
		variants,
		productTitle: variants[0].productTitle,
		productImageUrl: variants[0].productImageUrl,
		index,
		totalProducts,
		prevIndex: index > 0 ? index - 1 : null,
		nextIndex: index < totalProducts - 1 ? index + 1 : null
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();
		const updates: Promise<unknown>[] = [];

		for (const [key, value] of data.entries()) {
			if (key.startsWith('newStock_')) {
				const id = key.replace('newStock_', '');
				const newStock = value === '' ? null : parseInt(value as string, 10);
				updates.push(
					db.update(inventoryItems).set({ newStock }).where(eq(inventoryItems.id, id))
				);
			}
		}
		await Promise.all(updates);
		return { success: true };
	},

	complete: async ({ params }) => {
		await db.update(inventorySessions)
			.set({ completedAt: new Date().toISOString() })
			.where(eq(inventorySessions.id, params.sessionId));
		redirect(302, `/stores/${params.storeId}/inventory/${params.sessionId}/complete`);
	}
};
