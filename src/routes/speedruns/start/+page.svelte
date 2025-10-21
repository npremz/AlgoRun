<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	let isSubmitting = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-4">Start Speedrun</h1>
		
		<div class="mb-6">
			<h2 class="text-xl font-semibold text-gray-800 mb-2">{data.list.name}</h2>
			{#if data.list.description}
				<p class="text-gray-600 mb-4">{data.list.description}</p>
			{/if}
			<div class="flex items-center gap-4 text-sm text-gray-600">
				<span>📝 {data.list.problems?.length || 0} problems</span>
			</div>
		</div>
		
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
			<h3 class="font-semibold text-blue-900 mb-3">⏱️ How it works:</h3>
			<ul class="space-y-2 text-blue-800 text-sm">
				<li>✓ The timer starts when you click "Start Speedrun"</li>
				<li>✓ Solve each problem on LeetCode</li>
				<li>✓ Mark problems as completed as you finish them</li>
				<li>✓ Your time will be recorded for each problem</li>
				<li>✓ The speedrun ends when all problems are completed</li>
			</ul>
		</div>
		
		{#if form?.error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
				<p class="text-red-800 text-sm">{form.error}</p>
			</div>
		{/if}
		
		<form 
			method="POST" 
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="flex gap-4"
		>
			<input type="hidden" name="listId" value={data.list.id} />
			
			<button
				type="submit"
				disabled={isSubmitting}
				class="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				{isSubmitting ? '🚀 Starting...' : '🚀 Start Speedrun'}
			</button>
			
			<a
				href="/lists/{data.list.id}"
				class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
			>
				Cancel
			</a>
		</form>
	</div>
</div>
