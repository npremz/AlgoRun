import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (!username || !password || !confirmPassword) {
			return fail(400, { message: 'All fields are required' });
		}

		if (typeof username !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
			return fail(400, { message: 'Invalid form data' });
		}
		
		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		if (username.length < 3 || username.length > 31) {
			return fail(400, { message: 'Username must be between 3 and 31 characters' });
		}

		if (password.length < 6 || password.length > 255) {
			return fail(400, { message: 'Password must be between 6 and 255 characters' });
		}

		// Check if username already exists
		const [existingUser] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, username));

		if (existingUser) {
			return fail(400, { message: 'Username already taken' });
		}

		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const userId = generateUserId();

		await db.insert(table.user).values({
			id: userId,
			username,
			passwordHash
		});

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		throw redirect(303, '/');
	}
};

function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(10));
	return encodeBase32LowerCase(bytes);
}
