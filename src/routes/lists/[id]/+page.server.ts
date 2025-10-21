import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params, locals }) => {
	const response = await fetch(`/api/lists/${params.id}`);
	
	if (!response.ok) {
		throw error(response.status, 'List not found');
	}
	
	const list = await response.json();
	
	return {
		list,
		user: locals.user
	};
};
