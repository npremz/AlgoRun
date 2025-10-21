<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	
	let { data }: { data: PageData } = $props();
	
	let showAddForm = $state(false);
	let submitting = $state(false);
	let deletingId = $state<number | null>(null);
	let editingId = $state<number | null>(null);
	
	let formData = $state({
		title: '',
		description: '',
		difficulty: 'easy' as 'easy' | 'medium' | 'hard',
		tags: '',
		externalUrl: ''
	});
	
	const isOwner = $derived(!data.list.isPublic && data.list.createdBy === data.user?.id);
	
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'text-green-700 bg-green-100';
			case 'medium': return 'text-yellow-700 bg-yellow-100';
			case 'hard': return 'text-red-700 bg-red-100';
			default: return 'text-gray-700 bg-gray-100';
		}
	};
	
	function resetForm() {
		formData = {
			title: '',
			description: '',
			difficulty: 'easy',
			tags: '',
			externalUrl: ''
		};
		showAddForm = false;
		editingId = null;
	}
	
	function startEdit(problem: any) {
		editingId = problem.id;
		showAddForm = false;
		formData = {
			title: problem.title,
			description: problem.description || '',
			difficulty: problem.difficulty,
			tags: problem.tags?.join(', ') || '',
			externalUrl: problem.externalUrl || ''
		};
	}
	
	async function addProblem() {
		if (!formData.title.trim()) {
			alert('Problem title is required');
			return;
		}
		
		submitting = true;
		
		try {
			const tags = formData.tags
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0);
			
			const response = await fetch('/api/problems', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					listId: data.list.id,
					title: formData.title.trim(),
					description: formData.description.trim() || null,
					difficulty: formData.difficulty,
					tags,
					externalUrl: formData.externalUrl.trim() || null
				})
			});
			
			if (response.ok) {
				resetForm();
				await invalidateAll();
			} else {
				const error = await response.json();
				alert(`Failed to add problem: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error adding problem:', error);
			alert('An error occurred while adding the problem');
		} finally {
			submitting = false;
		}
	}
	
	async function updateProblem() {
		if (!formData.title.trim()) {
			alert('Problem title is required');
			return;
		}
		
		submitting = true;
		
		try {
			const tags = formData.tags
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0);
			
			const response = await fetch(`/api/problems/${editingId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title.trim(),
					description: formData.description.trim() || null,
					difficulty: formData.difficulty,
					tags,
					externalUrl: formData.externalUrl.trim() || null
				})
			});
			
			if (response.ok) {
				resetForm();
				await invalidateAll();
			} else {
				const error = await response.json();
				alert(`Failed to update problem: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error updating problem:', error);
			alert('An error occurred while updating the problem');
		} finally {
			submitting = false;
		}
	}
	
	async function saveProblem() {
		if (editingId) {
			await updateProblem();
		} else {
			await addProblem();
		}
	}
	
	async function deleteProblem(problemId: number, problemTitle: string) {
		if (!confirm(`Are you sure you want to delete "${problemTitle}"?\n\nThis action cannot be undone.`)) {
			return;
		}
		
		deletingId = problemId;
		
		try {
			const response = await fetch(`/api/problems/${problemId}`, {
				method: 'DELETE'
			});
			
			if (response.ok) {
				await invalidateAll();
			} else {
				const error = await response.json();
				alert(`Failed to delete problem: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error deleting problem:', error);
			alert('An error occurred while deleting the problem');
		} finally {
			deletingId = null;
		}
	}
</script>

<div class="mb-6">
	<a href="/lists" class="text-blue-600 hover:text-blue-800 text-sm">← Back to lists</a>
</div>

<div class="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-10 shadow-sm">
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-6">
		<div class="flex-1 min-w-0">
			<h1 class="text-title mb-3 break-words">{data.list.name}</h1>
			{#if data.list.description}
				<p class="text-gray-600 text-lg leading-relaxed">{data.list.description}</p>
			{/if}
		</div>
		{#if data.list.isPublic}
			<span class="px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-lg self-start">Public</span>
		{:else}
			<span class="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg self-start">Private</span>
		{/if}
	</div>
	
	<div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
		<div class="flex items-center gap-2">
			<span class="text-lg">📋</span>
			<span class="font-medium">{data.list.problems?.length || 0} problems</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-lg">📅</span>
			<span>Created {new Date(data.list.createdAt).toLocaleDateString()}</span>
		</div>
	</div>
	
	<div>
		<a
			href="/speedruns/start?listId={data.list.id}"
			class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
		>
			<span class="text-xl mr-2">🏃</span>
			<span>Start Speedrun</span>
		</a>
	</div>
</div>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
		<h2 class="text-heading font-bold text-gray-900">Problems</h2>
		{#if isOwner && !editingId}
			<button
				onclick={() => { showAddForm = !showAddForm; if (!showAddForm) resetForm(); }}
				class="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm hover:shadow-md transition-all"
			>
				{showAddForm ? 'Cancel' : '+ Add Problem'}
			</button>
		{/if}
	</div>
	
	{#if showAddForm && !editingId}
		<div class="bg-white border-2 border-green-200 rounded-lg p-6 mb-4">
			<h3 class="text-heading text-gray-900 mb-4">Add New Problem</h3>
			<form onsubmit={(e) => { e.preventDefault(); saveProblem(); }} class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-semibold text-gray-900 mb-1">
						Title <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						bind:value={formData.title}
						required
						placeholder="e.g., Two Sum"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
					/>
				</div>
				
				<div>
					<label for="description" class="block text-sm font-semibold text-gray-900 mb-1">
						Description
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						rows="2"
						placeholder="Brief description of the problem..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
					></textarea>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="difficulty" class="block text-sm font-semibold text-gray-900 mb-1">
							Difficulty <span class="text-red-500">*</span>
						</label>
						<select
							id="difficulty"
							bind:value={formData.difficulty}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
						>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
							<option value="hard">Hard</option>
						</select>
					</div>
					
					<div>
						<label for="tags" class="block text-sm font-semibold text-gray-900 mb-1">
							Tags
						</label>
						<input
							type="text"
							id="tags"
							bind:value={formData.tags}
							placeholder="array, hash-table"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
						/>
						<p class="text-xs text-gray-500 mt-1">Comma-separated</p>
					</div>
				</div>
				
				<div>
					<label for="externalUrl" class="block text-sm font-semibold text-gray-900 mb-1">
						LeetCode URL
					</label>
					<input
						type="url"
						id="externalUrl"
						bind:value={formData.externalUrl}
						placeholder="https://leetcode.com/problems/..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
					/>
				</div>
				
				<div class="flex gap-3">
					<button
						type="submit"
						disabled={submitting}
						class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed rounded-lg transition-colors"
					>
						{submitting ? 'Adding...' : 'Add Problem'}
					</button>
					<button
						type="button"
						onclick={resetForm}
						class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}
	
	{#if data.list.problems && data.list.problems.length > 0}
		{#each data.list.problems as problem}
			{#if editingId === problem.id}
				<!-- Editing mode: show inline in the list -->
				<div class="bg-white border-2 border-blue-200 rounded-lg p-6">
					<h3 class="text-heading text-gray-900 mb-4">Edit Problem</h3>
					<form onsubmit={(e) => { e.preventDefault(); saveProblem(); }} class="space-y-4">
						<div>
							<label for="edit-title" class="block text-sm font-semibold text-gray-900 mb-1">
								Title <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="edit-title"
								bind:value={formData.title}
								required
								placeholder="e.g., Two Sum"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							/>
						</div>
						
						<div>
							<label for="edit-description" class="block text-sm font-semibold text-gray-900 mb-1">
								Description
							</label>
							<textarea
								id="edit-description"
								bind:value={formData.description}
								rows="2"
								placeholder="Brief description of the problem..."
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
							></textarea>
						</div>
						
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="edit-difficulty" class="block text-sm font-semibold text-gray-900 mb-1">
									Difficulty <span class="text-red-500">*</span>
								</label>
								<select
									id="edit-difficulty"
									bind:value={formData.difficulty}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
								>
									<option value="easy">Easy</option>
									<option value="medium">Medium</option>
									<option value="hard">Hard</option>
								</select>
							</div>
							
							<div>
								<label for="edit-tags" class="block text-sm font-semibold text-gray-900 mb-1">
									Tags
								</label>
								<input
									type="text"
									id="edit-tags"
									bind:value={formData.tags}
									placeholder="array, hash-table"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
								/>
								<p class="text-xs text-gray-500 mt-1">Comma-separated</p>
							</div>
						</div>
						
						<div>
							<label for="edit-externalUrl" class="block text-sm font-semibold text-gray-900 mb-1">
								LeetCode URL
							</label>
							<input
								type="url"
								id="edit-externalUrl"
								bind:value={formData.externalUrl}
								placeholder="https://leetcode.com/problems/..."
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							/>
						</div>
						
						<div class="flex gap-3">
							<button
								type="submit"
								disabled={submitting}
								class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors"
							>
								{submitting ? 'Updating...' : 'Update Problem'}
							</button>
							<button
								type="button"
								onclick={resetForm}
								class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			{:else}
				<!-- Normal display mode -->
				<div class="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
					{#if isOwner}
						<div class="absolute bottom-5 right-5 flex gap-2 z-10">
							<button
								onclick={() => startEdit(problem)}
								class="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
								title="Edit problem"
							>
								<span class="text-lg">✏️</span>
							</button>
							<button
								onclick={() => deleteProblem(problem.id, problem.title)}
								disabled={deletingId === problem.id}
								class="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								title="Delete problem"
							>
								{#if deletingId === problem.id}
									<span class="text-sm">⏳</span>
								{:else}
									<span class="text-lg">🗑️</span>
								{/if}
							</button>
						</div>
					{/if}
					
					<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
						<div class="flex-1 min-w-0 {isOwner ? 'pr-20' : ''}">
							<div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
								<div class="flex items-center gap-3">
									<span class="text-gray-500 font-mono text-sm font-semibold">#{problem.order + 1}</span>
									<h3 class="text-xl font-semibold text-gray-900 break-words">{problem.title}</h3>
								</div>
								<span class="px-3 py-1 text-xs font-bold rounded-full {getDifficultyColor(problem.difficulty)} self-start uppercase tracking-wide">
									{problem.difficulty}
								</span>
							</div>
							
							{#if problem.description}
								<p class="text-gray-600 mb-4 leading-relaxed">{problem.description}</p>
							{/if}
							
							{#if problem.tags && problem.tags.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each problem.tags as tag}
										<span class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-100">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
						
						{#if problem.externalUrl}
							<a
								href={problem.externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="w-full lg:w-auto lg:flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
							>
								View Problem →
							</a>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	{:else}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
			<p class="text-gray-600">No problems in this list yet.</p>
		</div>
	{/if}
</div>
