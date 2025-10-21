<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<h1 class="text-3xl font-bold mb-6">Problem Lists</h1>
<p class="text-gray-600 mb-8">Browse and create problem lists for speedrun challenges.</p>

{#if data.lists.length === 0}
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<p class="text-blue-800">No lists available yet. Create your first list!</p>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.lists as list}
			<a
				href="/lists/{list.id}"
				class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
			>
				<div class="flex justify-between items-start mb-2">
					<h2 class="text-xl font-semibold text-gray-900">{list.name}</h2>
					{#if list.isPublic}
						<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">Public</span>
					{:else}
						<span class="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded">Private</span>
					{/if}
				</div>
				{#if list.description}
					<p class="text-gray-600 text-sm mb-4">{list.description}</p>
				{/if}
				
				<!-- Best time or not attempted badge -->
				{#if data.bestTimes[list.id]}
					<div class="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
						<span class="text-blue-600">🏆</span>
						<div class="flex-1">
							<div class="text-xs text-blue-600 font-semibold">Best Time</div>
							<div class="text-sm font-mono font-bold text-blue-800">{formatTime(data.bestTimes[list.id])}</div>
						</div>
					</div>
				{:else}
					<div class="mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded">
						<div class="text-xs text-gray-500 italic">Not attempted yet</div>
					</div>
				{/if}
				
				<div class="text-sm text-gray-500">
					Created {new Date(list.createdAt).toLocaleDateString()}
				</div>
			</a>
		{/each}
	</div>
{/if}
