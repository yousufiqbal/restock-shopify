import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404);

	const [session] = await db.select().from(restockSessions).where(
		and(eq(restockSessions.id, params.sessionId), eq(restockSessions.storeId, params.storeId))
	);
	if (!session) error(404);

	const items = await db
		.select()
		.from(restockItems)
		.where(and(eq(restockItems.sessionId, params.sessionId), eq(restockItems.skip, false)))
		.orderBy(asc(restockItems.position), asc(restockItems.variantPosition), asc(restockItems.id));

	const restockList = items.filter((i) => (i.actualRestock ?? 0) > 0);

	return { store, session, restockList };
};

export const actions: Actions = {
	toggleOrdered: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) error(400);

		const [item] = await db.select({ orderedAt: restockItems.orderedAt }).from(restockItems).where(eq(restockItems.id, id));
		if (!item) error(404);

		await db.update(restockItems)
			.set({ orderedAt: item.orderedAt ? null : new Date().toISOString() })
			.where(eq(restockItems.id, id));

		return { success: true };
	}
};
