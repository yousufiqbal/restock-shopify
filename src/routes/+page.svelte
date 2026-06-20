<script lang="ts">
	let { data } = $props();
</script>

{#if !data.user}
<div class="min-h-screen bg-gray-950 flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white mb-2">RestockHQ</h1>
		<p class="text-gray-400 mb-8">Shopify restock management</p>
		<a href="/auth/login" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition">
			Sign In
		</a>
	</div>
</div>
{:else}
<div class="min-h-screen bg-gray-950 p-6">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold text-white mb-6">Your Stores</h1>
		<a href="/stores" class="block bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-6 transition">
			<div class="font-medium">Manage Stores →</div>
			<div class="text-gray-400 text-sm mt-1">Add stores, configure lead times, start restock sessions</div>
		</a>
	</div>
</div>
{/if}
