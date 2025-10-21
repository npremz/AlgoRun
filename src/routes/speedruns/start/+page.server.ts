import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const listId = url.searchParams.get('listId');
	
	if (!listId) {
		throw error(400, 'List ID is required');
	}
	
	const response = await fetch(`/api/lists/${listId}`);
	
	if (!response.ok) {
		throw error(response.status, 'List not found');
	}
	
	const list = await response.json();
	
	return {
		list
	};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const listId = formData.get('listId');
		
		if (!listId) {
			return { error: 'List ID is required' };
		}
		
		const response = await fetch('/api/speedruns', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ listId: parseInt(listId as string) })
		});
		
		if (!response.ok) {
			const error = await response.json();
			return { error: error.error || 'Failed to start speedrun' };
		}
		
		const attempt = await response.json();
		throw redirect(303, `/speedruns/${attempt.id}`);
	}
};
