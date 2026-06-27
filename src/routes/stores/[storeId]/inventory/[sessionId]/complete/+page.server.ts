import { db } from '$lib/server/db';
import { stores, inventorySessions, inventoryItems } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setInventoryLevel } from '$lib/server/shopify';

export const load: PageServerLoad = async ({ params }) => {
	const [[store], [session], items] = await Promise.all([
		db.select().from(stores).where(eq(stores.id, params.storeId)),
		db.select().from(inventorySessions).where(
			and(eq(inventorySessions.id, params.sessionId), eq(inventorySessions.storeId, params.storeId))
		),
		db.select().from(inventoryItems)
			.where(eq(inventoryItems.sessionId, params.sessionId))
			.orderBy(asc(inventoryItems.position), asc(inventoryItems.variantPosition))
	]);

	if (!store) error(404, 'Store not found');
	if (!session) error(404, 'Session not found');

	const checkedItems = items.filter(i => i.newStock != null && i.newStock !== i.currentStock);

	return { store, session, checkedItems };
};

export const actions: Actions = {
	apply: async ({ params }) => {
		const [[store], [session], allItems] = await Promise.all([
			db.select().from(stores).where(eq(stores.id, params.storeId)),
			db.select().from(inventorySessions).where(eq(inventorySessions.id, params.sessionId)),
			db.select().from(inventoryItems).where(eq(inventoryItems.sessionId, params.sessionId))
		]);

		if (!store || !session) error(404);

		const toUpdate = allItems.filter(i => i.newStock != null && i.newStock !== i.currentStock);
		const errors: string[] = [];

		for (const item of toUpdate) {
			try {
				await setInventoryLevel(store.domain, store.apiToken, item.inventoryItemId, item.locationId, item.newStock!);
			} catch (e) {
				errors.push(`${item.productTitle}${item.variantTitle ? ` (${item.variantTitle})` : ''}: ${(e as Error).message}`);
			}
		}

		if (errors.length > 0) {
			return { success: false, errors, applied: toUpdate.length - errors.length };
		}
		return { success: true, applied: toUpdate.length };
	}
};
