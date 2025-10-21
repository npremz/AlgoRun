<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	
	let { children, data }: { children: any; data: LayoutData } = $props();
	
	let mobileMenuOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<nav class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<!-- Logo -->
				<div class="flex items-center">
					<a href="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
						AlgoRun
					</a>
				</div>
				
				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-6">
					<!-- Nav Links -->
					<div class="flex items-center gap-2">
						<a href="/lists" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all">
							Lists
						</a>
						<a href="/speedruns" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all">
							My Speedruns
						</a>
					</div>
					
					<!-- Auth Section -->
					<div class="flex items-center gap-4 pl-6 border-l-2 border-gray-200">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
								<span class="text-sm font-semibold text-blue-600">
									{data.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<span class="text-sm text-gray-700">{data.user.username}</span>
						</div>
						<form method="POST" action="/logout">
							<button type="submit" class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
								Logout
							</button>
						</form>
					</div>
				</div>
				
				<!-- Mobile menu button -->
				<div class="md:hidden flex items-center">
					<button
						type="button"
						onclick={() => mobileMenuOpen = !mobileMenuOpen}
						class="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all"
						aria-expanded={mobileMenuOpen}
					>
						<span class="sr-only">Open main menu</span>
						<div class="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
							<span class="w-6 h-0.5 bg-current transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
							<span class="w-6 h-0.5 bg-current transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}"></span>
							<span class="w-6 h-0.5 bg-current transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}"></span>
						</div>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Mobile menu with animation -->
		<div 
			class="md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-200"
			style="max-height: {mobileMenuOpen ? '500px' : '0px'}"
		>
			<div class="px-4 pt-4 pb-4 space-y-2 bg-gray-50">
				<div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
					Navigation
				</div>
				<a
					href="/lists"
					onclick={() => mobileMenuOpen = false}
					class="block px-4 py-3 rounded-lg text-base font-medium text-gray-900 bg-white hover:bg-gray-100 active:bg-gray-200 transition-all shadow-sm"
				>
					Lists
				</a>
				<a
					href="/speedruns"
					onclick={() => mobileMenuOpen = false}
					class="block px-4 py-3 rounded-lg text-base font-medium text-gray-900 bg-white hover:bg-gray-100 active:bg-gray-200 transition-all shadow-sm"
				>
					My Speedruns
				</a>
			</div>
			
			<div class="pt-4 pb-4 border-t-2 border-gray-300 bg-white">
				<div class="px-4 mb-3">
					<div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
						Account
					</div>
					<div class="px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
								<span class="text-base font-bold text-white">
									{data.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-semibold text-gray-900 truncate">{data.user.username}</div>
								<div class="text-xs text-gray-600">Signed in</div>
							</div>
						</div>
					</div>
				</div>
				<div class="px-4">
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="w-full px-4 py-3 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-sm"
						>
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>
{/if}

<div class="min-h-screen flex flex-col">
	<main class={data.user ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1' : 'flex-1'}>
		{@render children?.()}
	</main>

	<footer class="bg-gray-50 border-t border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="text-sm text-gray-600">
					© {new Date().getFullYear()} AlgoRun. Built for speedrunning algorithms.
				</div>
				<div class="flex items-center gap-4">
					<a 
						href="https://github.com/npremz" 
						target="_blank" 
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
						</svg>
						<span>@npremz</span>
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
