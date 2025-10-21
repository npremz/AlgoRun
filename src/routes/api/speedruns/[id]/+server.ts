import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/speedruns/[id] - Get a specific speedrun attempt
export async function GET(event: RequestEvent) {
	const { user } = event.locals;
	const attemptId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(attemptId)) {
		return json({ error: 'Invalid attempt ID' }, { status: 400 });
	}

	const [attempt] = await db
		.select()
		.from(table.speedrunAttempt)
		.where(eq(table.speedrunAttempt.id, attemptId));

	if (!attempt) {
		return json({ error: 'Attempt not found' }, { status: 404 });
	}

	if (attempt.userId !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	return json(attempt);
}

// PATCH /api/speedruns/[id] - Update speedrun progress
export async function PATCH(event: RequestEvent) {
	const { user } = event.locals;
	const attemptId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(attemptId)) {
		return json({ error: 'Invalid attempt ID' }, { status: 400 });
	}

	const [attempt] = await db
		.select()
		.from(table.speedrunAttempt)
		.where(eq(table.speedrunAttempt.id, attemptId));

	if (!attempt) {
		return json({ error: 'Attempt not found' }, { status: 404 });
	}

	if (attempt.userId !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	if (attempt.isCompleted) {
		return json({ error: 'Attempt already completed' }, { status: 400 });
	}

	const body = await event.request.json();
	const { problemId, timeSeconds, completed } = body;

	if (problemId === undefined || timeSeconds === undefined || completed === undefined) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	// Update problem timings
	const timings = [...(attempt.problemTimings || [])];
	const existingIndex = timings.findIndex(t => t.problemId === problemId);

	if (existingIndex >= 0) {
		timings[existingIndex] = { problemId, timeSeconds, completed };
	} else {
		timings.push({ problemId, timeSeconds, completed });
	}

	const problemsCompleted = timings.filter(t => t.completed).length;
	const isCompleted = problemsCompleted === attempt.problemsTotal;

	const updates: Partial<typeof table.speedrunAttempt.$inferInsert> = {
		problemTimings: timings,
		problemsCompleted
	};

	if (isCompleted) {
		updates.isCompleted = true;
		updates.completedAt = new Date();
		updates.totalTimeSeconds = timings.reduce((sum, t) => sum + t.timeSeconds, 0);
	}

	const [updated] = await db
		.update(table.speedrunAttempt)
		.set(updates)
		.where(eq(table.speedrunAttempt.id, attemptId))
		.returning();

	return json(updated);
}

// DELETE /api/speedruns/[id] - Delete a speedrun attempt
export async function DELETE(event: RequestEvent) {
	const { user } = event.locals;
	const attemptId = parseInt(event.params.id!);

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (isNaN(attemptId)) {
		return json({ error: 'Invalid attempt ID' }, { status: 400 });
	}

	const [attempt] = await db
		.select()
		.from(table.speedrunAttempt)
		.where(eq(table.speedrunAttempt.id, attemptId));

	if (!attempt) {
		return json({ error: 'Attempt not found' }, { status: 404 });
	}

	if (attempt.userId !== user.id) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	await db.delete(table.speedrunAttempt).where(eq(table.speedrunAttempt.id, attemptId));

	return json({ success: true });
}
