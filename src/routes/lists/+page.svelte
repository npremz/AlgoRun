<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	
	let { data }: { data: PageData } = $props();
	
	let deletingId = $state<number | null>(null);
	
	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	
	async function deleteList(listId: number, listName: string) {
		if (!confirm(`Are you sure you want to delete "${listName}"?\n\nThis action cannot be undone and will delete all associated problems and speedrun attempts.`)) {
			return;
		}
		
		deletingId = listId;
		
		try {
			const response = await fetch(`/api/lists/${listId}`, {
				method: 'DELETE'
			});
			
			if (response.ok) {
				await invalidateAll();
			} else {
				const error = await response.json();
				alert(`Failed to delete list: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error deleting list:', error);
			alert('An error occurred while deleting the list');
		} finally {
			deletingId = null;
		}
	}
</script>

<h1 class="text-title mb-4">Problem Lists</h1>
<p class="text-gray-600 text-lg mb-10 leading-relaxed">Browse and create problem lists for speedrun challenges.</p>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
	<!-- Create New List Card -->
	<a
		href="/lists/create"
		class="block p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all group"
	>
		<div class="flex flex-col items-center justify-center h-full min-h-[240px] text-blue-600">
			<div class="text-7xl mb-4 group-hover:scale-110 transition-transform">+</div>
			<h2 class="text-xl font-bold mb-2">Create New List</h2>
			<p class="text-sm text-blue-500">Add your own problem list</p>
		</div>
	</a>
	
	{#if data.lists.length > 0}
		{#each data.lists as list}
			<div class="relative block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all group">
				<!-- Delete button for private lists owned by user -->
				{#if !list.isPublic && list.createdBy === data.user?.id}
					<button
						onclick={(e) => {
							e.preventDefault();
							deleteList(list.id, list.name);
						}}
						disabled={deletingId === list.id}
						class="absolute top-5 right-5 p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
						title="Delete list"
					>
						{#if deletingId === list.id}
							<span class="text-sm">⏳</span>
						{:else}
							<span class="text-lg">🗑️</span>
						{/if}
					</button>
				{/if}
				
				<a href="/lists/{list.id}" class="block">
					<div class="flex justify-between items-start mb-4 pr-10">
						<h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{list.name}</h2>
						{#if list.isPublic}
							<span class="px-3 py-1.5 text-xs font-bold text-green-800 bg-green-100 rounded-lg">Public</span>
						{:else}
							<span class="px-3 py-1.5 text-xs font-bold text-gray-800 bg-gray-100 rounded-lg">Private</span>
						{/if}
					</div>
				{#if list.description}
					<p class="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{list.description}</p>
				{/if}
				
				<!-- Best time or not attempted badge -->
				{#if data.bestTimes[list.id]}
					<div class="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
						<span class="text-xl">🏆</span>
						<div class="flex-1">
							<div class="text-xs text-blue-600 font-bold uppercase tracking-wide">Best Time</div>
							<div class="text-lg font-mono font-bold text-blue-800">{formatTime(data.bestTimes[list.id])}</div>
						</div>
					</div>
				{:else}
					<div class="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
						<div class="text-xs text-gray-500 italic">Not attempted yet</div>
					</div>
				{/if}
				
					<div class="flex items-center gap-2 text-sm text-gray-500">
						<span class="text-base">📅</span>
						<span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
					</div>
				</a>
			</div>
		{/each}
	{/if}
</div>
