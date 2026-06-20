import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/api/auth', '/auth/setup-2fa', '/auth/verify-2fa'];

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const path = event.url.pathname;
	const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

	if (!event.locals.user) {
		if (!isPublic && path !== '/') redirect(302, '/auth/login');
	} else if (!isPublic) {
		// A full session only exists after 2FA is verified, so just force enrollment
		const user = event.locals.user as any;
		if (!user.twoFactorEnabled) redirect(302, '/auth/setup-2fa');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
