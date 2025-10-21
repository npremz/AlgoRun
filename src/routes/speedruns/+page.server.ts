import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch('/api/speedruns');
	const attempts = await response.json();
	
	// Get unique list IDs and fetch list details
	const listIds = [...new Set(attempts.map((a: any) => a.listId))];
	const lists = await Promise.all(
		listIds.map(async (id) => {
			const res = await fetch(`/api/lists/${id}`);
			if (res.ok) {
				const list = await res.json();
				return { id, name: list.name };
			}
			return { id, name: 'Unknown' };
		})
	);
	
	const listsMap = new Map(lists.map(l => [l.id, l.name]));
	
	return {
		attempts,
		listsMap: Object.fromEntries(listsMap)
	};
};

export const actions: Actions = {
	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const attemptId = formData.get('attemptId');
		
		if (!attemptId) {
			return fail(400, { error: 'Attempt ID is required' });
		}
		
		const response = await fetch(`/api/speedruns/${attemptId}`, {
			method: 'DELETE'
		});
		
		if (!response.ok) {
			return fail(response.status, { error: 'Failed to delete speedrun' });
		}
		
		return { success: true };
	}
};
