import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
	}

	// Protection des routes - autoriser uniquement login, register et API publiques
	const publicRoutes = ['/login', '/register'];
	const isPublicRoute = publicRoutes.some(route => event.url.pathname.startsWith(route));

	if (!event.locals.user && !isPublicRoute) {
		throw redirect(303, '/login');
	}

	// Rediriger vers / si connecté et sur login/register
	if (event.locals.user && isPublicRoute) {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const handle: Handle = handleAuth;
