<script lang="ts">
	let { data } = $props();
</script>

{#if !data.user}
<div class="min-h-screen bg-white flex items-center justify-center px-4">
	<div class="text-center max-w-sm w-full">
		<div class="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl text-white text-xl font-bold mb-6">R</div>
		<h1 class="text-3xl font-semibold text-gray-900 mb-2">RestockHQ</h1>
		<p class="text-gray-500 mb-8 text-sm">Shopify restock management</p>
		<a href="/auth/login" class="inline-block w-full bg-black hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors">
			Sign in
		</a>
		<p class="mt-4 text-sm text-gray-400">
			No account? <a href="/auth/register" class="text-gray-700 hover:text-black underline underline-offset-2">Register</a>
		</p>
	</div>
</div>
{:else}
<div class="min-h-screen bg-fafafa p-6">
	<div class="max-w-2xl mx-auto pt-12">
		<a href="/stores" class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors">
			Go to stores →
		</a>
	</div>
</div>
{/if}
