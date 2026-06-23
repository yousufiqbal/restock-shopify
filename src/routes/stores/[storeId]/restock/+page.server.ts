import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, and, desc, inArray, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchProducts, fetchSales, calcRecommendation, resolveVariantImage } from '$lib/server/shopify';
import { getLwaToken, fetchAmazonListings, createOrdersReport } from '$lib/server/amazon';
import { AMAZON_AWS_ACCESS_KEY_ID, AMAZON_AWS_SECRET_ACCESS_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
	const [store] = await db.select().from(stores).where(eq(stores.id, params.storeId));
	if (!store) error(404, 'Store not found');

	const sessions = await db
		.select()
		.from(restockSessions)
		.where(eq(restockSessions.storeId, params.storeId))
		.orderBy(desc(restockSessions.startedAt))
		.limit(10);

	// Per-session progress: done/total products + resume index (first unfinished)
	const ids = sessions.map((s) => s.id);
	const progress = new Map<string, { done: number; total: number; resumeIndex: number }>();

	if (ids.length) {
		const rows = await db
			.select({
				sessionId: restockItems.sessionId,
				position: restockItems.position,
				actualRestock: restockItems.actualRestock,
				skip: restockItems.skip
			})
			.from(restockItems)
			.where(inArray(restockItems.sessionId, ids))
			.orderBy(asc(restockItems.position));

		// group: sessionId -> position -> done?
		const bySession = new Map<string, Map<number, boolean>>();
		for (const r of rows) {
			let posMap = bySession.get(r.sessionId);
			if (!posMap) bySession.set(r.sessionId, (posMap = new Map()));
			const prev = posMap.get(r.position) ?? false;
			posMap.set(r.position, prev || r.actualRestock != null || r.skip);
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
			if (resumeIndex === -1) resumeIndex = 0; // all done -> start at first
			progress.set(sid, { done, total, resumeIndex });
		}
	}

	const sessionsWithProgress = sessions.map((s) => ({
		...s,
		progress: progress.get(s.id) ?? { done: 0, total: 0, resumeIndex: 0 }
	}));

	return { store, sessions: sessionsWithProgress };
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

		if (store.storeType === 'amazon') {
			// Amazon path: fetch listings synchronously, request sales report async
			if (!store.lwaClientId || !store.lwaClientSecret || !store.lwaRefreshToken || !store.marketplaceId) {
				error(400, 'Amazon store credentials not configured');
			}
			const accessToken = await getLwaToken(store.lwaClientId, store.lwaClientSecret, store.lwaRefreshToken);
			const creds = { accessToken, awsKeyId: AMAZON_AWS_ACCESS_KEY_ID, awsSecret: AMAZON_AWS_SECRET_ACCESS_KEY };

			const listings = await fetchAmazonListings(store.domain, store.marketplaceId, creds);

			// Insert items with sales = 0 (will be updated when report finishes)
			const items: (typeof restockItems.$inferInsert)[] = [];
			let position = 0;
			for (const listing of listings) {
				items.push({
					sessionId: session.id,
					productId: listing.asin,
					variantId: listing.sku,
					productTitle: listing.title,
					variantTitle: null,
					sku: listing.sku,
					productImageUrl: listing.imageUrl,
					variantImageUrl: null,
					sales30: 0,
					sales60: 0,
					sales90: 0,
					currentStock: listing.currentStock,
					recAir: calcRecommendation(0, listing.currentStock, store.airLeadDays),
					recSea: calcRecommendation(0, listing.currentStock, store.seaLeadDays),
					position: position++,
					variantPosition: 0
				});
			}
			for (let i = 0; i < items.length; i += 100) {
				await db.insert(restockItems).values(items.slice(i, i + 100));
			}

			// Kick off async sales report
			const reportId = await createOrdersReport(store.marketplaceId, creds);
			await db.update(restockSessions)
				.set({ totalProducts: position, reportId })
				.where(eq(restockSessions.id, session.id));

			redirect(302, `/stores/${params.storeId}/restock/${session.id}/preparing`);
		}

		// Shopify path (unchanged)
		const products = await fetchProducts(store.domain, store.apiToken);
		const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
		const salesMap = await fetchSales(store.domain, store.apiToken, variantIds);

		const items: (typeof restockItems.$inferInsert)[] = [];
		let position = 0;
		let variantPosition = 0;

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
					position,
					variantPosition: variantPosition++
				});
			}
			position++;
		}

		for (let i = 0; i < items.length; i += 100) {
			await db.insert(restockItems).values(items.slice(i, i + 100));
		}
		await db.update(restockSessions).set({ totalProducts: position }).where(eq(restockSessions.id, session.id));

		redirect(302, `/stores/${params.storeId}/restock/${session.id}/0`);
	},

	delete: async ({ request, params }) => {
		const data = await request.formData();
		const sessionId = data.get('sessionId');
		if (typeof sessionId !== 'string') error(400, 'Missing session id');

		// Verify session belongs to this store before deleting
		const [session] = await db
			.select({ id: restockSessions.id })
			.from(restockSessions)
			.where(and(eq(restockSessions.id, sessionId), eq(restockSessions.storeId, params.storeId)));
		if (!session) error(404, 'Session not found');

		// Delete items first — libSQL has foreign_keys OFF by default, so no cascade
		await db.delete(restockItems).where(eq(restockItems.sessionId, sessionId));
		await db.delete(restockSessions).where(eq(restockSessions.id, sessionId));

		return { deleted: true };
	}
};
