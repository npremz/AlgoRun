import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/lists - Get all public lists + user's private lists
export async function GET(event: RequestEvent) {
	const { user } = event.locals;

	let lists;
	if (user) {
		lists = await db
			.select()
			.from(table.problemList)
			.where(eq(table.problemList.isPublic, true))
			.orderBy(desc(table.problemList.createdAt));

		const userLists = await db
			.select()
			.from(table.problemList)
			.where(eq(table.problemList.createdBy, user.id))
			.orderBy(desc(table.problemList.createdAt));

		const publicListIds = new Set(lists.map(l => l.id));
		const uniqueUserLists = userLists.filter(l => !publicListIds.has(l.id));
		lists = [...lists, ...uniqueUserLists];
	} else {
		lists = await db
			.select()
			.from(table.problemList)
			.where(eq(table.problemList.isPublic, true))
			.orderBy(desc(table.problemList.createdAt));
	}

	return json(lists);
}

// POST /api/lists - Create a new list
export async function POST(event: RequestEvent) {
	const { user } = event.locals;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await event.request.json();
	const { name, description, isPublic } = body;

	if (!name || typeof name !== 'string') {
		return json({ error: 'Name is required' }, { status: 400 });
	}

	const [list] = await db
		.insert(table.problemList)
		.values({
			name,
			description: description || null,
			createdBy: user.id,
			isPublic: isPublic || false
		})
		.returning();

	return json(list, { status: 201 });
}
