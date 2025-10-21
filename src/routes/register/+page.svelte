<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	
	let password = $state('');
	let confirmPassword = $state('');
	let passwordsMatch = $derived(password === confirmPassword);
	let showMismatchError = $state(false);
</script>

<div class="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
		<div>
			<h2 class="text-center text-title text-gray-900">Create an account</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">sign in to your account</a>
			</p>
		</div>

		<form method="POST" class="mt-8 space-y-6" onsubmit={(e) => {
			if (!passwordsMatch) {
				e.preventDefault();
				showMismatchError = true;
				return false;
			}
			showMismatchError = false;
		}}>
			{#if form?.message}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">{form.message}</p>
				</div>
			{/if}
			
			{#if showMismatchError}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">Passwords do not match</p>
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						autocomplete="username"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						placeholder="3-31 characters"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						autocomplete="new-password"
						bind:value={password}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						placeholder="At least 6 characters"
					/>
				</div>
				
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						autocomplete="new-password"
						bind:value={confirmPassword}
						oninput={() => { if (showMismatchError && passwordsMatch) showMismatchError = false; }}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {confirmPassword && !passwordsMatch ? 'border-red-500' : ''}"
						placeholder="Re-enter your password"
					/>
					{#if confirmPassword && !passwordsMatch}
						<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
					{/if}
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={!!(confirmPassword && !passwordsMatch)}
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
				>
					Create account
				</button>
			</div>
		</form>
	</div>
</div>
