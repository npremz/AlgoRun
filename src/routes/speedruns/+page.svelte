<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	
	let { data }: { data: PageData } = $props();
	
	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	function confirmDelete(listName: string): boolean {
		return confirm(`Are you sure you want to delete this speedrun attempt for "${listName}"? This action cannot be undone.`);
	}
	
	// Sort attempts by date (most recent first)
	let sortedAttempts = $derived(
		[...data.attempts].sort((a, b) => 
			new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
		)
	);
	
	let completedAttempts = $derived(sortedAttempts.filter(a => a.isCompleted));
	let inProgressAttempts = $derived(sortedAttempts.filter(a => !a.isCompleted));
</script>

<h1 class="text-3xl font-bold mb-6">My Speedruns</h1>
<p class="text-gray-600 mb-8">View your speedrun attempts and track your progress.</p>

{#if inProgressAttempts.length > 0}
	<div class="mb-8">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">🏃 In Progress</h2>
		<div class="space-y-3">
			{#each inProgressAttempts as attempt}
				<div class="bg-white border-2 border-blue-300 rounded-lg p-4">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<a href="/speedruns/{attempt.id}" class="flex-1 min-w-0">
							<div>
								<h3 class="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 truncate">
									{data.listsMap[attempt.listId] || 'Unknown List'}
								</h3>
								<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
									<span>📝 {attempt.problemsCompleted} / {attempt.problemsTotal} completed</span>
									<span class="hidden sm:inline">🕒 Started {formatDate(attempt.startedAt)}</span>
									<span class="sm:hidden">🕒 {new Date(attempt.startedAt).toLocaleDateString()}</span>
								</div>
							</div>
						</a>
						<div class="flex items-center gap-2 sm:flex-shrink-0">
							<a 
								href="/speedruns/{attempt.id}"
								class="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
							>
								Continue →
							</a>
							<form 
								method="POST" 
								action="?/delete"
								use:enhance={({ cancel }) => {
									if (!confirmDelete(data.listsMap[attempt.listId] || 'Unknown List')) {
										cancel();
									}
									return async ({ update }) => {
										await update();
									};
								}}
							>
								<input type="hidden" name="attemptId" value={attempt.id} />
								<button
									type="submit"
									class="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
									title="Delete speedrun"
								>
									🗑️
								</button>
							</form>
						</div>
					</div>
					
					<!-- Progress bar -->
					<div class="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
						<div 
							class="bg-blue-600 h-full transition-all"
							style="width: {(attempt.problemsCompleted / attempt.problemsTotal) * 100}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if completedAttempts.length > 0}
	<div>
		<h2 class="text-xl font-semibold text-gray-900 mb-4">✅ Completed</h2>
		<div class="space-y-3">
			{#each completedAttempts as attempt}
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<a href="/speedruns/{attempt.id}" class="flex-1 min-w-0">
							<div>
								<h3 class="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 truncate">
									{data.listsMap[attempt.listId] || 'Unknown List'}
								</h3>
								<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
									<span>⏱️ {formatTime(attempt.totalTimeSeconds || 0)}</span>
									<span>📝 {attempt.problemsTotal} problems</span>
									<span class="hidden sm:inline">🏁 {formatDate(attempt.completedAt || attempt.startedAt)}</span>
									<span class="sm:hidden">🏁 {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}</span>
								</div>
							</div>
						</a>
						<div class="flex items-center gap-2 sm:flex-shrink-0">
							<span class="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
								Completed
							</span>
							<form 
								method="POST" 
								action="?/delete"
								use:enhance={({ cancel }) => {
									if (!confirmDelete(data.listsMap[attempt.listId] || 'Unknown List')) {
										cancel();
									}
									return async ({ update }) => {
										await update();
									};
								}}
							>
								<input type="hidden" name="attemptId" value={attempt.id} />
								<button
									type="submit"
									class="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
									title="Delete speedrun"
								>
									🗑️
								</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if data.attempts.length === 0}
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
		<p class="text-blue-800 mb-4">You haven't started any speedruns yet!</p>
		<a
			href="/lists"
			class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
		>
			Browse Problem Lists
		</a>
	</div>
{/if}
