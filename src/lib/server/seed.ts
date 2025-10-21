import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as table from './db/schema';
import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';

// Load .env file
config();

// Load DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema: table });

const problems = [
	{
		title: 'Range Sum Query - Immutable',
		difficulty: 'easy',
		tags: ['array', 'prefix-sum'],
		externalUrl: 'https://leetcode.com/problems/range-sum-query-immutable/',
		description: 'LeetCode 303 - Prefix Sum pattern'
	},
	{
		title: 'Valid Palindrome',
		difficulty: 'easy',
		tags: ['string', 'two-pointers'],
		externalUrl: 'https://leetcode.com/problems/valid-palindrome/',
		description: 'LeetCode 125 - Two pointers pattern'
	},
	{
		title: 'Maximum Average Subarray I',
		difficulty: 'easy',
		tags: ['array', 'sliding-window'],
		externalUrl: 'https://leetcode.com/problems/maximum-average-subarray-i/',
		description: 'LeetCode 643 - Sliding window pattern'
	},
	{
		title: 'Linked List Cycle',
		difficulty: 'easy',
		tags: ['linked-list', 'two-pointers'],
		externalUrl: 'https://leetcode.com/problems/linked-list-cycle/',
		description: 'LeetCode 141 - Fast and Slow pointer pattern'
	},
	{
		title: 'Reverse Linked List',
		difficulty: 'easy',
		tags: ['linked-list', 'recursion'],
		externalUrl: 'https://leetcode.com/problems/reverse-linked-list/',
		description: 'LeetCode 206 - In-place Reversal pattern'
	},
	{
		title: 'Next Greater Element I',
		difficulty: 'easy',
		tags: ['array', 'stack', 'monotonic-stack'],
		externalUrl: 'https://leetcode.com/problems/next-greater-element-i/',
		description: 'LeetCode 496 - Stack pattern'
	},
	{
		title: 'Kth Largest Element in an Array',
		difficulty: 'medium',
		tags: ['array', 'heap', 'quickselect'],
		externalUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
		description: 'LeetCode 215 - Top K Elements pattern'
	},
	{
		title: 'Merge Intervals',
		difficulty: 'medium',
		tags: ['array', 'sorting'],
		externalUrl: 'https://leetcode.com/problems/merge-intervals/',
		description: 'LeetCode 56 - Overlapping Intervals pattern'
	},
	{
		title: 'Binary Search',
		difficulty: 'easy',
		tags: ['array', 'binary-search'],
		externalUrl: 'https://leetcode.com/problems/binary-search/',
		description: 'LeetCode 704 - Binary Search pattern'
	},
	{
		title: 'Search in Rotated Sorted Array',
		difficulty: 'medium',
		tags: ['array', 'binary-search'],
		externalUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
		description: 'LeetCode 33 - Modified Binary Search pattern'
	},
	{
		title: 'Binary Tree Preorder Traversal',
		difficulty: 'easy',
		tags: ['tree', 'binary-tree', 'dfs'],
		externalUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
		description: 'LeetCode 144 - Binary Tree Traversal pattern'
	},
	{
		title: 'Binary Tree Inorder Traversal',
		difficulty: 'easy',
		tags: ['tree', 'binary-tree', 'dfs'],
		externalUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
		description: 'LeetCode 94 - Binary Tree Traversal pattern'
	},
	{
		title: 'Number of Islands',
		difficulty: 'medium',
		tags: ['array', 'dfs', 'bfs', 'matrix'],
		externalUrl: 'https://leetcode.com/problems/number-of-islands/',
		description: 'LeetCode 200 - Depth First Search pattern'
	},
	{
		title: 'Binary Tree Level Order Traversal',
		difficulty: 'medium',
		tags: ['tree', 'binary-tree', 'bfs'],
		externalUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
		description: 'LeetCode 102 - Breadth First Search pattern'
	},
	{
		title: 'Flood Fill',
		difficulty: 'easy',
		tags: ['array', 'dfs', 'bfs', 'matrix'],
		externalUrl: 'https://leetcode.com/problems/flood-fill/',
		description: 'LeetCode 733 - Matrix Traversal pattern'
	},
	{
		title: 'Subsets',
		difficulty: 'medium',
		tags: ['array', 'backtracking'],
		externalUrl: 'https://leetcode.com/problems/subsets/',
		description: 'LeetCode 78 - Backtracking pattern'
	},
	{
		title: 'Climbing Stairs',
		difficulty: 'easy',
		tags: ['dynamic-programming', 'math'],
		externalUrl: 'https://leetcode.com/problems/climbing-stairs/',
		description: 'LeetCode 70 - Fibonacci / Dynamic Programming pattern'
	},
	{
		title: 'House Robber',
		difficulty: 'medium',
		tags: ['array', 'dynamic-programming'],
		externalUrl: 'https://leetcode.com/problems/house-robber/',
		description: 'LeetCode 198 - Dynamic Programming pattern'
	}
];

async function seed() {
	console.log('🌱 Seeding database...');

	// Create a system user for the seed data
	const systemUserId = generateUserId();
	const [systemUser] = await db
		.insert(table.user)
		.values({
			id: systemUserId,
			username: 'system',
			passwordHash: await hash('system123456', {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			})
		})
		.onConflictDoNothing()
		.returning();

	if (!systemUser) {
		console.log('ℹ️  System user already exists, fetching...');
		// Get existing system user
		const existingUsers = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, 'system'));
		
		if (existingUsers.length === 0) {
			throw new Error('Failed to get system user');
		}
		
		console.log('📝 Creating Fundamentals list...');
		const [list] = await db
			.insert(table.problemList)
			.values({
				name: 'Fundamentals',
				description: 'Essential algorithmic patterns and data structures. Master these 18 problems to build a solid foundation for coding interviews.',
				createdBy: existingUsers[0].id,
				isPublic: true
			})
			.returning();

		console.log(`✅ Created list: ${list.name} (ID: ${list.id})`);

		// Add all problems to the list
		console.log('📚 Adding problems to the list...');
		for (let i = 0; i < problems.length; i++) {
			const problem = problems[i];
			await db.insert(table.problem).values({
				listId: list.id,
				title: problem.title,
				description: problem.description,
				difficulty: problem.difficulty,
				order: i,
				tags: problem.tags,
				externalUrl: problem.externalUrl
			});
			console.log(`  ✓ ${i + 1}. ${problem.title} (${problem.difficulty})`);
		}

		console.log('\n✨ Seed completed successfully!');
		console.log(`\n📊 Summary:`);
		console.log(`   - 1 list created (Fundamentals)`);
		console.log(`   - ${problems.length} problems added`);
		console.log(`   - System user: system / system123456`);
		
		await client.end();
		return;
	}

	// Create the Fundamentals list
	console.log('📝 Creating Fundamentals list...');
	const [list] = await db
		.insert(table.problemList)
		.values({
			name: 'Fundamentals',
			description: 'Essential algorithmic patterns and data structures. Master these 18 problems to build a solid foundation for coding interviews.',
			createdBy: systemUser.id,
			isPublic: true
		})
		.returning();

	console.log(`✅ Created list: ${list.name} (ID: ${list.id})`);

	// Add all problems to the list
	console.log('📚 Adding problems to the list...');
	for (let i = 0; i < problems.length; i++) {
		const problem = problems[i];
		await db.insert(table.problem).values({
			listId: list.id,
			title: problem.title,
			description: problem.description,
			difficulty: problem.difficulty,
			order: i,
			tags: problem.tags,
			externalUrl: problem.externalUrl
		});
		console.log(`  ✓ ${i + 1}. ${problem.title} (${problem.difficulty})`);
	}

	console.log('\n✨ Seed completed successfully!');
	console.log(`\n📊 Summary:`);
	console.log(`   - 1 list created (Fundamentals)`);
	console.log(`   - ${problems.length} problems added`);
	console.log(`   - System user: system / system123456`);
	
	await client.end();
}

function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(10));
	return encodeBase32LowerCase(bytes);
}

// Run the seed
seed()
	.then(() => {
		console.log('\n✅ Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Seed failed:', error);
		process.exit(1);
	});
