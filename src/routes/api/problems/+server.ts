import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, max, and } from 'drizzle-orm';

// Helper function to delete in-progress speedruns for a list
async function deleteInProgressSpeedruns(listId: number) {
	await db
		.delete(table.speedrunAttempt)
		.where(
			and(
				eq(table.speedrunAttempt.listId, listId),
				eq(table.speedrunAttempt.isCompleted, false)
			)
		);
}

// POST /api/problems - Create a new problem in a list
export async function POST(event: RequestEvent) {
	const { user } = event.locals;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await event.request.json();
	const { listId, title, description, difficulty, tags, externalUrl } = body;

	if (!listId || !title || !difficulty) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	// Check if user owns the list
	const [list] = await db
		.select()
		.from(table.problemList)
		.where(eq(table.problemList.id, listId));

	if (!list) {
		return json({ error: 'List not found' }, { status: 404 });
	}

	if (list.createdBy !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Delete all in-progress speedruns for this list
	await deleteInProgressSpeedruns(listId);

	// Get max order for this list
	const [maxOrder] = await db
		.select({ value: max(table.problem.order) })
		.from(table.problem)
		.where(eq(table.problem.listId, listId));

	const nextOrder = (maxOrder?.value ?? -1) + 1;

	const [problem] = await db
		.insert(table.problem)
		.values({
			listId,
			title,
			description: description || null,
			difficulty,
			order: nextOrder,
			tags: tags || [],
			externalUrl: externalUrl || null
		})
		.returning();

	return json(problem, { status: 201 });
}
