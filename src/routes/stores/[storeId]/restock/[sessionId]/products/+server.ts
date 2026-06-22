import { db } from '$lib/server/db';
import { restockItems } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// One scan per session (cached client-side) for the jump menu + progress —
// instead of scanning every row on every product navigation.
export const GET: RequestHandler = async ({ params }) => {
	const rows = await db
		.select({
			position: restockItems.position,
			productTitle: restockItems.productTitle,
			actualRestock: restockItems.actualRestock,
			skip: restockItems.skip
		})
		.from(restockItems)
		.where(eq(restockItems.sessionId, params.sessionId))
		.orderBy(asc(restockItems.position));

	const map = new Map<number, { index: number; title: string; done: boolean }>();
	for (const r of rows) {
		const existing = map.get(r.position);
		const done = r.actualRestock != null || r.skip;
		if (!existing) map.set(r.position, { index: r.position, title: r.productTitle, done });
		else if (done) existing.done = true;
	}

	const products = [...map.values()].sort((a, b) => a.index - b.index);
	return json({ products });
};
