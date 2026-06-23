// Polls Amazon report status and processes it when ready.
// Called by the preparing page every 10 seconds.
import { db } from '$lib/server/db';
import { stores, restockSessions, restockItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLwaToken, getReportStatus, downloadReport, parseSalesReport } from '$lib/server/amazon';
import { calcRecommendation } from '$lib/server/shopify';
import { AMAZON_AWS_ACCESS_KEY_ID, AMAZON_AWS_SECRET_ACCESS_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
	const [[session], [store]] = await Promise.all([
		db.select().from(restockSessions).where(
			and(eq(restockSessions.id, params.sessionId), eq(restockSessions.storeId, params.storeId))
		),
		db.select().from(stores).where(eq(stores.id, params.storeId))
	]);

	if (!session || !store) error(404);

	// Already has sales data (report was processed)
	if (!session.reportId) {
		return json({ status: 'ready' });
	}

	if (!store.lwaClientId || !store.lwaClientSecret || !store.lwaRefreshToken || !store.marketplaceId) {
		error(400, 'Amazon credentials missing');
	}

	const accessToken = await getLwaToken(store.lwaClientId, store.lwaClientSecret, store.lwaRefreshToken);
	const creds = { accessToken, awsKeyId: AMAZON_AWS_ACCESS_KEY_ID, awsSecret: AMAZON_AWS_SECRET_ACCESS_KEY };

	const { status, documentId } = await getReportStatus(session.reportId, creds);

	if (status === 'FATAL' || status === 'CANCELLED') {
		// Clear reportId so session opens without sales data rather than staying stuck
		await db.update(restockSessions).set({ reportId: null }).where(eq(restockSessions.id, session.id));
		return json({ status: 'ready', warning: 'Sales report failed — sales data unavailable' });
	}

	if (status !== 'DONE' || !documentId) {
		return json({ status: 'processing', reportStatus: status });
	}

	// Report is done — download, parse, and update items
	const tsv = await downloadReport(documentId, creds);
	const salesMap = parseSalesReport(tsv);

	// Update each item's sales + rec values
	const items = await db.select().from(restockItems).where(eq(restockItems.sessionId, session.id));
	const updates = items.map((item) => {
		const sales = salesMap.get(item.sku ?? '') ?? { s30: 0, s60: 0, s90: 0 };
		return db.update(restockItems).set({
			sales30: sales.s30,
			sales60: sales.s60,
			sales90: sales.s90,
			recAir: calcRecommendation(sales.s30, item.currentStock, store.airLeadDays),
			recSea: calcRecommendation(sales.s30, item.currentStock, store.seaLeadDays)
		}).where(eq(restockItems.id, item.id));
	});

	// Process in batches of 50 to avoid overwhelming the connection
	for (let i = 0; i < updates.length; i += 50) {
		await Promise.all(updates.slice(i, i + 50));
	}

	// Clear reportId — marks session as fully ready
	await db.update(restockSessions).set({ reportId: null }).where(eq(restockSessions.id, session.id));

	return json({ status: 'ready' });
};
