<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let submitting = $state(false);
</script>

<div class="max-w-2xl mx-auto">
	<div class="mb-6">
		<a href="/lists" class="text-blue-600 hover:text-blue-800 text-sm">
			← Back to Lists
		</a>
	</div>
	
	<h1 class="text-title mb-2">Create New List</h1>
	<p class="text-gray-600 mb-8">Create a private problem list for your speedrun challenges.</p>
	
	<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			{#if form?.error}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-red-800 text-sm">{form.error}</p>
				</div>
			{/if}
			
			<div class="mb-6">
				<label for="name" class="block text-sm font-semibold text-gray-900 mb-2">
					List Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					maxlength="100"
					placeholder="e.g., My Favorite Problems"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
				/>
				<p class="mt-1 text-xs text-gray-500">Maximum 100 characters</p>
			</div>
			
			<div class="mb-6">
				<label for="description" class="block text-sm font-semibold text-gray-900 mb-2">
					Description <span class="text-gray-400 text-xs font-normal">(optional)</span>
				</label>
				<textarea
					id="description"
					name="description"
					rows="4"
					placeholder="Describe what this list is about..."
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
				></textarea>
				<p class="mt-1 text-xs text-gray-500">Add some context about this problem list</p>
			</div>
			
			<div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex items-start gap-3">
					<span class="text-blue-600 text-xl">ℹ️</span>
					<div>
						<p class="text-sm text-blue-900 font-semibold mb-1">About Private Lists</p>
						<p class="text-sm text-blue-700">
							Your list will be private by default. Only you will be able to see and use it for speedruns. 
							You can add problems to it after creation.
						</p>
					</div>
				</div>
			</div>
			
			<div class="flex gap-4">
				<button
					type="submit"
					disabled={submitting}
					class="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
				>
					{submitting ? 'Creating...' : 'Create List'}
				</button>
				<a
					href="/lists"
					class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
	
	<div class="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
		<h2 class="text-lg font-semibold text-gray-900 mb-3">Next Steps</h2>
		<ol class="space-y-2 text-sm text-gray-700">
			<li class="flex items-start gap-2">
				<span class="font-semibold text-blue-600">1.</span>
				<span>After creating your list, you'll be redirected to its detail page</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="font-semibold text-blue-600">2.</span>
				<span>Add problems to your list</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="font-semibold text-blue-600">3.</span>
				<span>Start a speedrun and challenge yourself!</span>
			</li>
		</ol>
	</div>
</div>
