<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head><title>Register · Shopify Restock</title></svelte:head>

<div class="min-h-screen bg-white flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-10 h-10 bg-black rounded-xl text-white font-bold mb-4">R</div>
			<h1 class="text-xl font-semibold text-gray-900">Create your account</h1>
		</div>

		<form method="POST" use:enhance class="space-y-3">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
					{form.error}
				</div>
			{/if}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1.5" for="name">Name</label>
				<input id="name" name="name" type="text" required autocomplete="name"
					class="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition"
					placeholder="Your name" />
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1.5" for="email">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email"
					class="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition"
					placeholder="you@example.com" />
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1.5" for="password">Password</label>
				<input id="password" name="password" type="password" required minlength="8"
					class="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition"
					placeholder="Min. 8 characters" />
			</div>
			<button type="submit" class="w-full bg-black hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-1">
				Create account
			</button>
		</form>

		<p class="text-center text-sm text-gray-500 mt-6">
			Already have an account? <a href="/auth/login" class="text-gray-900 font-medium hover:underline">Sign in</a>
		</p>
	</div>
</div>
