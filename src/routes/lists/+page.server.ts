import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const response = await fetch('/api/lists');
	const lists = await response.json();
	
	// Get all speedrun attempts for the user
	const attemptsResponse = await fetch('/api/speedruns');
	const attempts = await attemptsResponse.json();
	
	// Calculate best time for each list
	const bestTimes = new Map<number, number>();
	attempts
		.filter((a: any) => a.isCompleted && a.totalTimeSeconds)
		.forEach((a: any) => {
			const currentBest = bestTimes.get(a.listId);
			if (!currentBest || a.totalTimeSeconds < currentBest) {
				bestTimes.set(a.listId, a.totalTimeSeconds);
			}
		});
	
	return {
		lists,
		bestTimes: Object.fromEntries(bestTimes),
		user: locals.user
	};
};
