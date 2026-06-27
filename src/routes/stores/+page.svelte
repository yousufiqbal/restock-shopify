<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>Stores · Shopify Restock</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
	<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
		<div>
			<p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Dashboard</p>
			<h1 class="text-3xl font-bold text-gray-900 tracking-tight">Your Stores</h1>
		</div>
		<a href="/stores/new"
			class="press self-start inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
			<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
			Add store
		</a>
	</div>

	{#if data.stores.length === 0}
	<div class="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
		<div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
			<svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
		</div>
		<p class="text-sm font-semibold text-gray-800 mb-1">No stores yet</p>
		<p class="text-sm text-gray-400 mb-6">Connect your first Shopify store to get started.</p>
		<a href="/stores/new" class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
			<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
			Add store
		</a>
	</div>
	{:else}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.stores as store}
		<a href="/stores/{store.id}"
			class="group relative bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 animate-fade-in-up">
			<!-- Store icon + name -->
			<div class="flex items-start justify-between gap-3">
				<div class="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
					<svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
				</div>
				<svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
			</div>

			<div class="flex-1 min-w-0">
				<div class="font-semibold text-gray-900 text-sm truncate">{store.name}</div>
				<div class="text-xs text-gray-400 font-mono mt-0.5 truncate">{store.domain}</div>
			</div>

			<!-- Lead days -->
			<div class="flex items-center gap-2 pt-1 border-t border-gray-100">
				<span class="inline-flex items-center gap-1 text-xs text-gray-500">
					<span class="text-gray-300">✈</span> {store.airLeadDays}d air
				</span>
				<span class="text-gray-200">·</span>
				<span class="inline-flex items-center gap-1 text-xs text-gray-500">
					<span class="text-gray-300">🚢</span> {store.seaLeadDays}d sea
				</span>
			</div>
		</a>
		{/each}

		<!-- Add store card -->
		<a href="/stores/new"
			class="group border border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center min-h-[148px] transition-all hover:bg-gray-50 animate-fade-in-up">
			<div class="w-9 h-9 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
				<svg class="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
			</div>
			<span class="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Add store</span>
		</a>
	</div>
	{/if}
</div>
