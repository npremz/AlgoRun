<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	
	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<nav class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="text-xl font-bold text-gray-900">AlgoRun</a>
					<div class="ml-10 flex items-baseline space-x-4">
						<a href="/lists" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Lists</a>
						<a href="/speedruns" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Speedruns</a>
					</div>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-gray-700 text-sm">Welcome, {data.user.username}</span>
					<form method="POST" action="/logout">
						<button type="submit" class="text-gray-700 hover:text-gray-900 text-sm font-medium">Logout</button>
					</form>
				</div>
			</div>
		</div>
	</nav>
{/if}

<main class={data.user ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}>
	{@render children?.()}
</main>
