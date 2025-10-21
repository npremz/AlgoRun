<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<div class="text-center py-12 px-4">
	<h1 class="text-hero mb-4">Welcome to AlgoRun</h1>
	<p class="text-subheading text-gray-600 mb-8">
		Practice algorithmic problems with speedrun challenges
	</p>
	
	<div class="flex flex-col sm:flex-row justify-center gap-4">
		<a
			href="/lists"
			class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
		>
			Browse Problem Lists
		</a>
		<a
			href="/speedruns"
			class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
		>
			My Speedruns
		</a>
	</div>
	
	<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
		<div class="p-6 bg-white rounded-lg shadow">
			<h3 class="text-heading text-gray-900 mb-2">Create Lists</h3>
			<p class="text-gray-600">Build custom problem lists for targeted practice</p>
		</div>
		<div class="p-6 bg-white rounded-lg shadow">
			<h3 class="text-heading text-gray-900 mb-2">Speedrun Mode</h3>
			<p class="text-gray-600">Race against the clock to solve problems</p>
		</div>
		<div class="p-6 bg-white rounded-lg shadow">
			<h3 class="text-heading text-gray-900 mb-2">Track Progress</h3>
			<p class="text-gray-600">Monitor your improvement over time</p>
		</div>
	</div>
</div>
