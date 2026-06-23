import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	storeId: params.storeId,
	sessionId: params.sessionId
});
