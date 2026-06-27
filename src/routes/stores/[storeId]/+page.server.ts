import { db } from '$lib/server/db';
import { stores, restockSessions, inventorySessions } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404, 'Store not found');

	const [[restock], [inventory]] = await Promise.all([
		db.select({ total: count() }).from(restockSessions).where(eq(restockSessions.storeId, params.storeId)),
		db.select({ total: count() }).from(inventorySessions).where(eq(inventorySessions.storeId, params.storeId))
	]);

	return { store, restockCount: restock.total, inventoryCount: inventory.total };
};
