<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Two-factor verification · Shopify Restock</title></svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-semibold text-gray-900">Two-factor authentication</h1>
			<p class="text-sm text-gray-500 mt-2">Enter the 6-digit code from Google Authenticator.</p>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
			<form method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}} class="space-y-4">
				{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
				{/if}

				<input
					name="code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength="6"
					placeholder="000000"
					required
					autofocus
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-2xl font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
				/>

				<button type="submit" disabled={loading}
					class="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
					{loading ? 'Verifying…' : 'Verify'}
				</button>
			</form>
		</div>

		<p class="text-center text-xs text-gray-400 mt-4">
			<a href="/auth/logout" class="hover:text-gray-600 transition-colors">Sign out</a>
		</p>
	</div>
</div>
