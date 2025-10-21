<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	
	let { data }: { data: PageData } = $props();
	
	// Timer state
	let elapsedSeconds = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let baseTimeSeconds = 0; // Time already elapsed when page loaded (not reactive)
	
	// Completion notification
	let showCompletionModal = $state(false);
	let finalTime = $state(0);
	
	// Problem completion tracking
	let problemTimings = $state<Map<number, { timeSeconds: number; completed: boolean }>>(
		new Map(data.attempt.problemTimings?.map((t: any) => [t.problemId, t]) || [])
	);
	
	// Reference point for timer (set once in onMount)
	let timerStartReference = 0;
	
	// Format seconds to HH:MM:SS
	function formatTime(seconds: number): string {
		if (seconds < 0) seconds = 0;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	
	// Confirm before navigating away from active speedrun
	beforeNavigate(({ cancel }) => {
		if (!data.attempt.isCompleted && elapsedSeconds > 0 && !showCompletionModal) {
			if (!confirm('You have an active speedrun in progress. Are you sure you want to leave? Your progress will be saved.')) {
				cancel();
			}
		}
	});
	
	// Beforeunload listener
	let handleBeforeUnload: ((e: BeforeUnloadEvent) => void) | null = null;
	
	// Start timer
	onMount(() => {
		if (!data.attempt.isCompleted) {
			// Calculate how much time has already elapsed since the speedrun started
			const serverStart = new Date(data.attempt.startedAt).getTime();
			const now = Date.now();
			const secondsSinceStart = Math.floor((now - serverStart) / 1000);
			
			// Store base time and reference point (only once, won't change)
			baseTimeSeconds = Math.max(0, secondsSinceStart);
			timerStartReference = Date.now();
			
			// Set initial display
			elapsedSeconds = baseTimeSeconds;
			
			// Start counting from here
			timerInterval = setInterval(() => {
				const localElapsed = Math.floor((Date.now() - timerStartReference) / 1000);
				elapsedSeconds = baseTimeSeconds + localElapsed;
			}, 1000);
		} else {
			elapsedSeconds = data.attempt.totalTimeSeconds || 0;
		}
		
		// Add beforeunload listener to warn user before leaving
		handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!data.attempt.isCompleted && !showCompletionModal) {
				e.preventDefault();
				e.returnValue = '';
				return '';
			}
		};
		
		window.addEventListener('beforeunload', handleBeforeUnload);
	});
	
	onDestroy(() => {
		if (handleBeforeUnload) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});
	
	// Toggle problem completion
	async function toggleProblem(problemId: number) {
		const currentStatus = problemTimings.get(problemId);
		const newCompleted = !currentStatus?.completed;
		const timeAtCompletion = elapsedSeconds;
		
		// Update local state immediately
		problemTimings.set(problemId, {
			timeSeconds: timeAtCompletion,
			completed: newCompleted
		});
		problemTimings = new Map(problemTimings); // Trigger reactivity
		
		// Send to server
		try {
			const response = await fetch(`/api/speedruns/${data.attempt.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					problemId,
					timeSeconds: timeAtCompletion,
					completed: newCompleted
				})
			});
			
			if (!response.ok) {
				// Revert on error
				if (currentStatus) {
					problemTimings.set(problemId, currentStatus);
				} else {
					problemTimings.delete(problemId);
				}
				problemTimings = new Map(problemTimings);
				alert('Failed to update problem status');
				return;
			}
			
			const updatedAttempt = await response.json();
			
			// Check if completed
			if (updatedAttempt.isCompleted && !data.attempt.isCompleted) {
				if (timerInterval) {
					clearInterval(timerInterval);
					timerInterval = null;
				}
				data.attempt = updatedAttempt;
				
				// Show completion modal
				finalTime = updatedAttempt.totalTimeSeconds || 0;
				showCompletionModal = true;
			}
		} catch (error) {
			console.error('Error updating problem:', error);
			alert('Failed to update problem status');
		}
	}
	
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'text-green-700 bg-green-100';
			case 'medium': return 'text-yellow-700 bg-yellow-100';
			case 'hard': return 'text-red-700 bg-red-100';
			default: return 'text-gray-700 bg-gray-100';
		}
	};
	
	let completedCount = $derived(Array.from(problemTimings.values()).filter(t => t.completed).length);
	let progress = $derived((completedCount / data.attempt.problemsTotal) * 100);
</script>

<svelte:head>
	<title>Speedrun - {data.list.name}</title>
</svelte:head>

<!-- Completion Modal -->
{#if showCompletionModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
			<div class="mb-6">
				<div class="text-6xl mb-4">🎉</div>
				<h2 class="text-3xl font-bold text-gray-900 mb-2">Speedrun Complete!</h2>
				<p class="text-gray-600 mb-6">Congratulations! You've completed all problems.</p>
			</div>
			
			<div class="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
				<div class="text-sm text-gray-600 mb-2">Final Time</div>
				<div class="text-5xl font-mono font-bold text-green-600 mb-2">
					{formatTime(finalTime)}
				</div>
				<div class="text-sm text-gray-600">
					{data.attempt.problemsTotal} problems completed
				</div>
			</div>
			
			<div class="space-y-3">
				<button
					onclick={() => showCompletionModal = false}
					class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
				>
					View Results
				</button>
				<a
					href="/speedruns"
					class="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
				>
					Back to History
				</a>
			</div>
		</div>
	</div>
{/if}

{#if data.attempt.isCompleted}
	<div class="bg-green-50 border-b border-green-200 p-4 mb-6">
		<div class="max-w-7xl mx-auto">
			<h2 class="text-xl font-bold text-green-900 mb-2">🎉 Speedrun Completed!</h2>
			<p class="text-green-800">
				Total time: <span class="font-bold">{formatTime(data.attempt.totalTimeSeconds || 0)}</span>
			</p>
		</div>
	</div>
{:else}
	<!-- Timer Header -->
	<div class="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">{data.list.name}</h1>
					<p class="text-blue-100 text-sm">{completedCount} / {data.attempt.problemsTotal} problems completed</p>
				</div>
				<div class="text-right">
					<div class="text-4xl font-mono font-bold">
						{formatTime(elapsedSeconds)}
					</div>
					<div class="text-blue-100 text-sm">Elapsed time</div>
				</div>
			</div>
			
			<!-- Progress bar -->
			<div class="mt-4 bg-blue-700 rounded-full h-2 overflow-hidden">
				<div 
					class="bg-white h-full transition-all duration-300"
					style="width: {progress}%"
				></div>
			</div>
		</div>
	</div>
{/if}

<div class="max-w-7xl mx-auto px-4 py-8">
	<div class="space-y-3">
		{#if data.list.problems && data.list.problems.length > 0}
			{#each data.list.problems as problem}
				{@const timing = problemTimings.get(problem.id)}
				{@const isCompleted = timing?.completed || false}
				
				<div 
					class="bg-white border-2 rounded-lg p-5 transition-all {isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'}"
				>
					<div class="flex items-start gap-4">
						<!-- Checkbox -->
						<button
							onclick={() => toggleProblem(problem.id)}
							disabled={data.attempt.isCompleted}
							class="flex-shrink-0 mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all {
								isCompleted 
									? 'bg-green-500 border-green-500' 
									: 'border-gray-300 hover:border-blue-500'
							} disabled:cursor-not-allowed"
						>
							{#if isCompleted}
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</button>
						
						<!-- Problem info -->
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2 flex-wrap">
								<span class="text-gray-500 font-mono text-sm">#{problem.order + 1}</span>
								<h3 class="text-lg font-semibold {isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}">
									{problem.title}
								</h3>
								<span class="px-2 py-1 text-xs font-semibold rounded {getDifficultyColor(problem.difficulty)}">
									{problem.difficulty}
								</span>
								
								{#if timing?.completed}
									<span class="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
										⏱️ {formatTime(timing.timeSeconds)}
									</span>
								{/if}
							</div>
							
							{#if problem.description}
								<p class="text-gray-600 text-sm mb-2">{problem.description}</p>
							{/if}
							
							{#if problem.tags && problem.tags.length > 0}
								<div class="flex flex-wrap gap-2 mb-3">
									{#each problem.tags as tag}
										<span class="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
						
						<!-- Link to problem -->
						{#if problem.externalUrl}
							<a
								href={problem.externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
							>
								View Problem →
							</a>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
	
	{#if !data.attempt.isCompleted}
		<div class="mt-8 text-center text-gray-500 text-sm">
			<p>Mark all problems as completed to finish the speedrun</p>
		</div>
	{:else}
		<div class="mt-8 flex justify-center gap-4">
			<a
				href="/speedruns"
				class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
			>
				View My Speedruns
			</a>
			<a
				href="/lists/{data.list.id}"
				class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
			>
				Back to List
			</a>
		</div>
	{/if}
</div>
