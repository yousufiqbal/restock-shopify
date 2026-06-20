import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allStores = await db.select().from(stores).orderBy(stores.createdAt);
	return { stores: allStores };
};
