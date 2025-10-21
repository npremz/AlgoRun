import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}
	return {};
};

export const actions = {
	default: async (event) => {
		const { user } = event.locals;

		if (!user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const description = formData.get('description');

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, { error: 'List name is required' });
		}

		if (name.length > 100) {
			return fail(400, { error: 'List name must be 100 characters or less' });
		}

		const [list] = await db
			.insert(table.problemList)
			.values({
				name: name.trim(),
				description: description && typeof description === 'string' ? description.trim() : null,
				createdBy: user.id,
				isPublic: false
			})
			.returning();

		redirect(303, `/lists/${list.id}`);
	}
} satisfies Actions;
