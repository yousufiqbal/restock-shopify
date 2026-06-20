import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchProducts, fetchSales, calcRecommendation, resolveVariantImage } from '$lib/server/shopify';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404, 'Store not found');

	const sessions = await db
		.select()
		.from(restockSessions)
		.where(eq(restockSessions.storeId, params.storeId))
		.orderBy(desc(restockSessions.startedAt))
		.limit(10);

	return { store, sessions };
};

export const actions: Actions = {
	start: async ({ params }) => {
		const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
		if (!store) error(404);

		// Create session
		const [session] = await db
			.insert(restockSessions)
			.values({ storeId: params.storeId })
			.returning();

		// Fetch Shopify data
		const products = await fetchProducts(store.domain, store.apiToken);

		const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
		const salesMap = await fetchSales(store.domain, store.apiToken, variantIds);

		// Build items grouped by product (position = product index, not variant index)
		const items: (typeof restockItems.$inferInsert)[] = [];
		let position = 0;

		for (const product of products) {
			const productImageUrl = product.images[0]?.src ?? null;
			for (const variant of product.variants) {
				const sales = salesMap.get(variant.id) ?? { s30: 0, s60: 0, s90: 0 };
				const currentStock = Math.max(0, variant.inventory_quantity ?? 0);
				const recAir = calcRecommendation(sales.s30, currentStock, store.airLeadDays);
				const recSea = calcRecommendation(sales.s30, currentStock, store.seaLeadDays);
				const variantImageUrl = resolveVariantImage(product, variant);

				items.push({
					sessionId: session.id,
					productId: String(product.id),
					variantId: String(variant.id),
					productTitle: product.title,
					variantTitle: product.variants.length > 1 ? variant.title : null,
					sku: variant.sku || null,
					productImageUrl,
					variantImageUrl,
					sales30: sales.s30,
					sales60: sales.s60,
					sales90: sales.s90,
					currentStock,
					recAir,
					recSea,
					position
				});
			}
			position++;
		}

		// Insert in batches of 100
		for (let i = 0; i < items.length; i += 100) {
			await db.insert(restockItems).values(items.slice(i, i + 100));
		}

		redirect(302, `/stores/${params.storeId}/restock/${session.id}/0`);
	}
};
