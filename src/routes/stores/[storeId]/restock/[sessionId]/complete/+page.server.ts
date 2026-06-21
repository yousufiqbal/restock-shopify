import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, and, gt, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404);

	const [session] = await db.select().from(restockSessions).where(
		and(eq(restockSessions.id, params.sessionId), eq(restockSessions.storeId, params.storeId))
	);
	if (!session) error(404);

	// Only items to restock: actualRestock > 0 and not skipped
	const items = await db
		.select()
		.from(restockItems)
		.where(
			and(
				eq(restockItems.sessionId, params.sessionId),
				eq(restockItems.skip, false)
			)
		)
		.orderBy(asc(restockItems.position), asc(restockItems.variantPosition), asc(restockItems.id));

	const restockList = items.filter((i) => (i.actualRestock ?? 0) > 0);

	return { store, session, restockList };
};
