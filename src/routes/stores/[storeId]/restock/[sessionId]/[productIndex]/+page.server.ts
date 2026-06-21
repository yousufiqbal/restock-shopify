import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const index = parseInt(params.productIndex, 10);
	if (isNaN(index) || index < 0) redirect(302, `../${params.sessionId}/0`);

	// Fire all reads in parallel — avoids stacking cross-region round-trips
	const [[store], [session], allItems] = await Promise.all([
		db.select().from(stores).where(eq(stores.id, params.storeId)),
		db
			.select()
			.from(restockSessions)
			.where(
				and(eq(restockSessions.id, params.sessionId), eq(restockSessions.storeId, params.storeId))
			),
		db
			.select()
			.from(restockItems)
			.where(eq(restockItems.sessionId, params.sessionId))
			.orderBy(asc(restockItems.position), asc(restockItems.variantPosition), asc(restockItems.id))
	]);

	if (!store) error(404, 'Store not found');
	if (!session) error(404, 'Session not found');

	const productMap = new Map<number, typeof allItems>();
	for (const item of allItems) {
		if (!productMap.has(item.position)) productMap.set(item.position, []);
		productMap.get(item.position)!.push(item);
	}

	const productPositions = [...productMap.keys()].sort((a, b) => a - b);
	const totalProducts = productPositions.length;

	if (index >= totalProducts) {
		redirect(302, `/stores/${params.storeId}/restock/${params.sessionId}/complete`);
	}

	const currentPosition = productPositions[index];
	const variants = productMap.get(currentPosition)!;

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

		// Run all updates in parallel — eliminates sequential round-trip delay
		const updates: Promise<unknown>[] = [];
		for (const [key, value] of data.entries()) {
			if (key.startsWith('actualRestock_')) {
				const id = key.replace('actualRestock_', '');
				const actual = value === '' ? null : parseInt(value as string, 10);
				updates.push(
					db.update(restockItems).set({ actualRestock: actual }).where(eq(restockItems.id, id))
				);
			}
		}
		await Promise.all(updates);

		return { success: true };
	},

	complete: async ({ params }) => {
		await db.update(restockSessions)
			.set({ completedAt: new Date().toISOString() })
			.where(eq(restockSessions.id, params.sessionId));
		redirect(302, `/stores/${params.storeId}/restock/${params.sessionId}/complete`);
	}
};
