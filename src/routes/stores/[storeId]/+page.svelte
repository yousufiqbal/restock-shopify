<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>{data.store.name} · Shopify Restock</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10">
	<!-- Breadcrumb + header -->
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">{data.store.name}</span>
	</div>

	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">{data.store.name}</h1>
			<p class="text-sm text-gray-500 font-mono mt-0.5">{data.store.domain}</p>
		</div>
		<a href="/stores/{data.store.id}/settings" title="Settings"
			class="press self-start inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors">
			<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
			Settings
		</a>
	</div>

	<!-- Tool cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<!-- Restock Sessions -->
		<a href="/stores/{data.store.id}/restock"
			class="group bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-6 shadow-sm hover:shadow transition-all animate-fade-in-up">
			<div class="flex items-start justify-between mb-4">
				<div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
					</svg>
				</div>
				<svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
			</div>
			<h2 class="text-sm font-semibold text-gray-900 mb-1">Restock Sessions</h2>
			<p class="text-xs text-gray-500 mb-3">Walk through products, enter restock quantities, export order list.</p>
			<span class="text-xs text-gray-400">{data.restockCount} session{data.restockCount !== 1 ? 's' : ''}</span>
		</a>

		<!-- Inventory Checkup -->
		<a href="/stores/{data.store.id}/inventory"
			class="group bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-6 shadow-sm hover:shadow transition-all animate-fade-in-up stagger">
			<div class="flex items-start justify-between mb-4">
				<div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
					</svg>
				</div>
				<svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
			</div>
			<h2 class="text-sm font-semibold text-gray-900 mb-1">Inventory Checkup</h2>
			<p class="text-xs text-gray-500 mb-3">Physically count stock, enter actual quantities, sync to Shopify.</p>
			<span class="text-xs text-gray-400">{data.inventoryCount} session{data.inventoryCount !== 1 ? 's' : ''}</span>
		</a>
	</div>
</div>
