<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>Stores · Shopify Restock</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">Stores</h1>
			<p class="text-sm text-gray-500 mt-0.5">Manage your Shopify stores and restock sessions</p>
		</div>
		<a href="/stores/new"
			class="press inline-flex items-center gap-1.5 self-start shrink-0 whitespace-nowrap bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
			<span class="text-lg leading-none">+</span> Add store
		</a>
	</div>

	{#if data.stores.length === 0}
	<div class="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
		<div class="text-3xl mb-3">🏪</div>
		<p class="text-sm font-medium text-gray-700 mb-1">No stores yet</p>
		<p class="text-sm text-gray-400 mb-4">Add your first Shopify or Amazon store to get started</p>
		<a href="/stores/new" class="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
			+ Add store
		</a>
	</div>
	{:else}
	<div class="stagger bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
		{#each data.stores as store}
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<div class="font-medium text-gray-900 text-sm">{store.name}</div>
					<span class="text-xs font-medium px-1.5 py-0.5 rounded-full {store.storeType === 'amazon' ? 'bg-[#FF9900]/10 text-[#c47800]' : 'bg-green-50 text-green-700'}">
						{store.storeType === 'amazon' ? 'Amazon' : 'Shopify'}
					</span>
				</div>
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
			<div class="flex items-center gap-2 shrink-0 sm:ml-4">
				<a href="/stores/{store.id}/restock"
					class="press text-xs bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap">
					Sessions
				</a>
				<a href="/stores/{store.id}/settings" title="Settings" aria-label="Settings"
					class="press text-gray-400 hover:text-gray-900 border border-gray-200 hover:border-gray-300 p-1.5 rounded-lg transition-colors">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
				</a>
			</div>
		</div>
		{/each}
	</div>
	{/if}
</div>
