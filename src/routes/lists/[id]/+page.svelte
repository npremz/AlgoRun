<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'text-green-700 bg-green-100';
			case 'medium': return 'text-yellow-700 bg-yellow-100';
			case 'hard': return 'text-red-700 bg-red-100';
			default: return 'text-gray-700 bg-gray-100';
		}
	};
</script>

<div class="mb-6">
	<a href="/lists" class="text-blue-600 hover:text-blue-800 text-sm">← Back to lists</a>
</div>

<div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
	<div class="flex justify-between items-start mb-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">{data.list.name}</h1>
			{#if data.list.description}
				<p class="text-gray-600">{data.list.description}</p>
			{/if}
		</div>
		{#if data.list.isPublic}
			<span class="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded">Public</span>
		{:else}
			<span class="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded">Private</span>
		{/if}
	</div>
	
	<div class="flex items-center gap-6 text-sm text-gray-600">
		<span>{data.list.problems?.length || 0} problems</span>
		<span>Created {new Date(data.list.createdAt).toLocaleDateString()}</span>
	</div>
	
	<div class="mt-6">
		<a
			href="/speedruns/start?listId={data.list.id}"
			class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
		>
			🏃 Start Speedrun
		</a>
	</div>
</div>

<div class="space-y-3">
	<h2 class="text-2xl font-bold text-gray-900 mb-4">Problems</h2>
	
	{#if data.list.problems && data.list.problems.length > 0}
		{#each data.list.problems as problem}
			<div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-2">
							<span class="text-gray-500 font-mono text-sm">#{problem.order + 1}</span>
							<h3 class="text-lg font-semibold text-gray-900">{problem.title}</h3>
							<span class="px-2 py-1 text-xs font-semibold rounded {getDifficultyColor(problem.difficulty)}">
								{problem.difficulty}
							</span>
						</div>
						
						{#if problem.description}
							<p class="text-gray-600 text-sm mb-2">{problem.description}</p>
						{/if}
						
						{#if problem.tags && problem.tags.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each problem.tags as tag}
									<span class="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
					
					{#if problem.externalUrl}
						<a
							href={problem.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
						>
							View Problem →
						</a>
					{/if}
				</div>
			</div>
		{/each}
	{:else}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
			<p class="text-gray-600">No problems in this list yet.</p>
		</div>
	{/if}
</div>
