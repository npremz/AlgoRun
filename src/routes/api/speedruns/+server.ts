import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/speedruns - Get user's speedrun attempts
export async function GET(event: RequestEvent) {
	const { user } = event.locals;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const listId = event.url.searchParams.get('listId');

	let query = db
		.select()
		.from(table.speedrunAttempt)
		.where(eq(table.speedrunAttempt.userId, user.id))
		.orderBy(desc(table.speedrunAttempt.startedAt));

	if (listId) {
		const parsedListId = parseInt(listId);
		if (!isNaN(parsedListId)) {
			query = db
				.select()
				.from(table.speedrunAttempt)
				.where(
					and(
						eq(table.speedrunAttempt.userId, user.id),
						eq(table.speedrunAttempt.listId, parsedListId)
					)
				)
				.orderBy(desc(table.speedrunAttempt.startedAt));
		}
	}

	const attempts = await query;
	return json(attempts);
}

// POST /api/speedruns - Start a new speedrun attempt
export async function POST(event: RequestEvent) {
	const { user } = event.locals;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await event.request.json();
	const { listId } = body;

	if (!listId) {
		return json({ error: 'List ID is required' }, { status: 400 });
	}

	// Check if list exists and is accessible
	const [list] = await db
		.select()
		.from(table.problemList)
		.where(eq(table.problemList.id, listId));

	if (!list) {
		return json({ error: 'List not found' }, { status: 404 });
	}

	if (!list.isPublic && list.createdBy !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Get total problems count
	const problems = await db
		.select()
		.from(table.problem)
		.where(eq(table.problem.listId, listId));

	if (problems.length === 0) {
		return json({ error: 'List has no problems' }, { status: 400 });
	}

	const [attempt] = await db
		.insert(table.speedrunAttempt)
		.values({
			userId: user.id,
			listId,
			problemsTotal: problems.length,
			problemsCompleted: 0,
			isCompleted: false,
			problemTimings: []
		})
		.returning();

	return json(attempt, { status: 201 });
}
