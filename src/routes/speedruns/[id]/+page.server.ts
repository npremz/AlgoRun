import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const attemptResponse = await fetch(`/api/speedruns/${params.id}`);
	
	if (!attemptResponse.ok) {
		throw error(attemptResponse.status, 'Speedrun not found');
	}
	
	const attempt = await attemptResponse.json();
	
	const listResponse = await fetch(`/api/lists/${attempt.listId}`);
	
	if (!listResponse.ok) {
		throw error(listResponse.status, 'List not found');
	}
	
	const list = await listResponse.json();
	
	return {
		attempt,
		list
	};
};
