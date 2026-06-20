<script lang="ts">
	let { data } = $props();
</script>

<div class="max-w-4xl mx-auto px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">Stores</h1>
			<p class="text-sm text-gray-500 mt-0.5">Manage your Shopify stores and restock sessions</p>
		</div>
		<a href="/stores/new"
			class="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
			<span class="text-lg leading-none">+</span> Add store
		</a>
	</div>

	{#if data.stores.length === 0}
	<div class="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
		<div class="text-3xl mb-3">🏪</div>
		<p class="text-sm font-medium text-gray-700 mb-1">No stores yet</p>
		<p class="text-sm text-gray-400 mb-4">Add your first Shopify store to get started</p>
		<a href="/stores/new" class="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
			+ Add store
		</a>
	</div>
	{:else}
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
		{#each data.stores as store}
		<div class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
			<div class="min-w-0">
				<div class="font-medium text-gray-900 text-sm">{store.name}</div>
				<div class="text-xs text-gray-400 mt-0.5 font-mono">{store.domain}</div>
				<div class="flex items-center gap-2 mt-1.5">
					<span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
						✈ {store.airLeadDays}d air
					</span>
					<span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
						🚢 {store.seaLeadDays}d sea
					</span>
				</div>
			</div>
			<div class="flex items-center gap-2 shrink-0 ml-4">
				<a href="/stores/{store.id}/settings"
					class="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors font-medium">
					Settings
				</a>
				<a href="/stores/{store.id}/restock"
					class="text-xs bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
					Restock
				</a>
			</div>
		</div>
		{/each}
	</div>
	{/if}
</div>
