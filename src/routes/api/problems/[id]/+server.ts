import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

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

// PATCH /api/problems/[id] - Update a problem
export async function PATCH(event: RequestEvent) {
	const { user } = event.locals;
	const problemId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(problemId)) {
		return json({ error: 'Invalid problem ID' }, { status: 400 });
	}

	const [problem] = await db
		.select()
		.from(table.problem)
		.where(eq(table.problem.id, problemId));

	if (!problem) {
		return json({ error: 'Problem not found' }, { status: 404 });
	}

	// Check if user owns the list
	const [list] = await db
		.select()
		.from(table.problemList)
		.where(eq(table.problemList.id, problem.listId));

	if (!list || list.createdBy !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Delete all in-progress speedruns for this list
	await deleteInProgressSpeedruns(problem.listId);

	const body = await event.request.json();
	const { title, description, difficulty, tags, externalUrl, order } = body;

	const updates: Partial<typeof table.problem.$inferInsert> = {};

	if (title !== undefined) updates.title = title;
	if (description !== undefined) updates.description = description;
	if (difficulty !== undefined) updates.difficulty = difficulty;
	if (tags !== undefined) updates.tags = tags;
	if (externalUrl !== undefined) updates.externalUrl = externalUrl;
	if (order !== undefined) updates.order = order;

	const [updated] = await db
		.update(table.problem)
		.set(updates)
		.where(eq(table.problem.id, problemId))
		.returning();

	return json(updated);
}

// DELETE /api/problems/[id] - Delete a problem
export async function DELETE(event: RequestEvent) {
	const { user } = event.locals;
	const problemId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(problemId)) {
		return json({ error: 'Invalid problem ID' }, { status: 400 });
	}

	const [problem] = await db
		.select()
		.from(table.problem)
		.where(eq(table.problem.id, problemId));

	if (!problem) {
		return json({ error: 'Problem not found' }, { status: 404 });
	}

	// Check if user owns the list
	const [list] = await db
		.select()
		.from(table.problemList)
		.where(eq(table.problemList.id, problem.listId));

	if (!list || list.createdBy !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Delete all in-progress speedruns for this list
	await deleteInProgressSpeedruns(problem.listId);

	await db.delete(table.problem).where(eq(table.problem.id, problemId));

	return json({ success: true });
}
