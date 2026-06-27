import { db } from '$lib/server/db';
import { stores, inventorySessions, inventoryItems } from '$lib/server/db/schema';
import { eq, and, desc, inArray, asc } from 'drizzle-orm';
import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchProducts, resolveVariantImage, fetchPrimaryLocationId } from '$lib/server/shopify';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404, 'Store not found');

	const sessions = await db
		.select()
		.from(inventorySessions)
		.where(eq(inventorySessions.storeId, params.storeId))
		.orderBy(desc(inventorySessions.startedAt))
		.limit(10);

	// Per-session progress
	const ids = sessions.map((s) => s.id);
	const progress = new Map<string, { done: number; total: number; resumeIndex: number }>();

	if (ids.length) {
		const rows = await db
			.select({ sessionId: inventoryItems.sessionId, position: inventoryItems.position, newStock: inventoryItems.newStock })
			.from(inventoryItems)
			.where(inArray(inventoryItems.sessionId, ids))
			.orderBy(asc(inventoryItems.position));

		const bySession = new Map<string, Map<number, boolean>>();
		for (const r of rows) {
			let posMap = bySession.get(r.sessionId);
			if (!posMap) bySession.set(r.sessionId, (posMap = new Map()));
			const prev = posMap.get(r.position) ?? false;
			posMap.set(r.position, prev || r.newStock != null);
		}

		for (const [sid, posMap] of bySession) {
			const positions = [...posMap.keys()].sort((a, b) => a - b);
			const total = positions.length;
			let done = 0;
			let resumeIndex = -1;
			positions.forEach((pos, i) => {
				if (posMap.get(pos)) done++;
				else if (resumeIndex === -1) resumeIndex = i;
			});
			if (resumeIndex === -1) resumeIndex = 0;
			progress.set(sid, { done, total, resumeIndex });
		}
	}

	return {
		store,
		sessions: sessions.map((s) => ({ ...s, progress: progress.get(s.id) ?? { done: 0, total: 0, resumeIndex: 0 } }))
	};
};

export const actions: Actions = {
	start: async ({ params }) => {
		const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
		if (!store) error(404);

		const [session] = await db.insert(inventorySessions).values({ storeId: params.storeId }).returning();

		let products: Awaited<ReturnType<typeof fetchProducts>>;
		let locationId: string;
		try {
			[products, locationId] = await Promise.all([
				fetchProducts(store.domain, store.apiToken),
				fetchPrimaryLocationId(store.domain, store.apiToken)
			]);
		} catch (e) {
			await db.delete(inventorySessions).where(eq(inventorySessions.id, session.id));
			return fail(422, { startError: (e as Error).message });
		}

		const items: (typeof inventoryItems.$inferInsert)[] = [];
		let position = 0;
		let variantPosition = 0;

		for (const product of products) {
			const productImageUrl = product.images[0]?.src ?? null;
			for (const variant of product.variants) {
				items.push({
					sessionId: session.id,
					productId: String(product.id),
					variantId: String(variant.id),
					inventoryItemId: String(variant.inventory_item_id),
					locationId,
					productTitle: product.title,
					variantTitle: product.variants.length > 1 ? variant.title : null,
					sku: variant.sku || null,
					productImageUrl,
					variantImageUrl: resolveVariantImage(product, variant),
					currentStock: Math.max(0, variant.inventory_quantity ?? 0),
					position,
					variantPosition: variantPosition++
				});
			}
			position++;
		}

		for (let i = 0; i < items.length; i += 100) {
			await db.insert(inventoryItems).values(items.slice(i, i + 100));
		}
		await db.update(inventorySessions).set({ totalProducts: position }).where(eq(inventorySessions.id, session.id));

		redirect(302, `/stores/${params.storeId}/inventory/${session.id}/0`);
	},

	delete: async ({ request, params }) => {
		const data = await request.formData();
		const sessionId = data.get('sessionId')?.toString();
		if (!sessionId) error(400);

		const [session] = await db.select({ id: inventorySessions.id }).from(inventorySessions)
			.where(and(eq(inventorySessions.id, sessionId), eq(inventorySessions.storeId, params.storeId)));
		if (!session) error(404);

		await db.delete(inventoryItems).where(eq(inventoryItems.sessionId, sessionId));
		await db.delete(inventorySessions).where(eq(inventorySessions.id, sessionId));

		return { deleted: true };
	}
};
