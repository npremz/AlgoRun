import { json, error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/lists/[id] - Get a specific list with its problems
export async function GET(event: RequestEvent) {
	const { user } = event.locals;
	const listId = parseInt(event.params.id!);

	if (isNaN(listId)) {
		return json({ error: 'Invalid list ID' }, { status: 400 });
	}

	const [list] = await db
		.select()
		.from(table.problemList)
		.where(eq(table.problemList.id, listId));

	if (!list) {
		return json({ error: 'List not found' }, { status: 404 });
	}

	// Check access rights
	if (!list.isPublic && (!user || list.createdBy !== user.id)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const problems = await db
		.select()
		.from(table.problem)
		.where(eq(table.problem.listId, listId))
		.orderBy(table.problem.order);

	return json({ ...list, problems });
}

// PATCH /api/lists/[id] - Update a list
export async function PATCH(event: RequestEvent) {
	const { user } = event.locals;
	const listId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(listId)) {
		return json({ error: 'Invalid list ID' }, { status: 400 });
	}

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

	const body = await event.request.json();
	const { name, description, isPublic } = body;

	const updates: Partial<typeof table.problemList.$inferInsert> = {
		updatedAt: new Date()
	};

	if (name !== undefined) updates.name = name;
	if (description !== undefined) updates.description = description;
	if (isPublic !== undefined) updates.isPublic = isPublic;

	const [updated] = await db
		.update(table.problemList)
		.set(updates)
		.where(eq(table.problemList.id, listId))
		.returning();

	return json(updated);
}

// DELETE /api/lists/[id] - Delete a list
export async function DELETE(event: RequestEvent) {
	const { user } = event.locals;
	const listId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(listId)) {
		return json({ error: 'Invalid list ID' }, { status: 400 });
	}

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

	await db.delete(table.problemList).where(eq(table.problemList.id, listId));

	return json({ success: true });
}
