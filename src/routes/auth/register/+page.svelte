<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<h1 class="text-2xl font-bold text-white text-center mb-8">RestockHQ</h1>
		<form method="POST" use:enhance class="bg-gray-900 rounded-xl p-6 space-y-4">
			{#if form?.error}
				<div class="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
					{form.error}
				</div>
			{/if}
			<div>
				<label class="block text-sm font-medium text-gray-400 mb-1" for="name">Name</label>
				<input
					id="name" name="name" type="text" required autocomplete="name"
					class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-400 mb-1" for="email">Email</label>
				<input
					id="email" name="email" type="email" required autocomplete="email"
					class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-400 mb-1" for="password">Password</label>
				<input
					id="password" name="password" type="password" required minlength="8"
					class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition">
				Create Account
			</button>
			<p class="text-center text-sm text-gray-500">
				Have an account? <a href="/auth/login" class="text-blue-400 hover:text-blue-300">Sign in</a>
			</p>
		</form>
	</div>
</div>
