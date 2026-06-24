<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let menuOpen = $state(false);

	// Local ordered state — plain object so $state tracks property writes
	let ordered = $state<Record<string, boolean>>(
		Object.fromEntries(data.restockList.map(i => [i.id, !!i.orderedAt]))
	);

	const orderedCount = $derived(Object.values(ordered).filter(Boolean).length);

	function thumbUrl(url: string | null | undefined): string {
		if (!url) return '';
		if (url.includes('cdn.shopify.com')) {
			const u = new URL(url);
			u.searchParams.set('width', '88');
			return u.toString();
		}
		if (url.includes('media-amazon.com') || url.includes('images-amazon.com')) {
			return url.replace(/(\.[a-z]+)(\?.*)?$/i, '._SX88_$1$2');
		}
		return url;
	}

	function exportCSV() {
		const headers = ['Product', 'Variant', 'Restock'];
		const rows = data.restockList.map((i) => [
			i.productTitle, i.variantTitle ?? '', i.actualRestock ?? 0
		]);
		const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `restock-${data.store.name}-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Restock list · {data.store.name} · Shopify Restock</title></svelte:head>

<svelte:window onclick={() => { if (menuOpen) menuOpen = false; }} />

<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
				<span class="text-gray-300">/</span>
				<a href="/stores/{data.store.id}/restock" class="hover:text-gray-900 transition-colors">{data.store.name}</a>
				<span class="text-gray-300">/</span>
				<span class="text-gray-900">Restock list</span>
			</div>
			<h1 class="text-2xl font-semibold text-gray-900">Restock List</h1>
			<p class="text-sm text-gray-500 mt-1">
				<span class="font-medium text-gray-900">{data.restockList.length}</span> items ·
				{#if orderedCount > 0}
				<span class="text-green-600 font-medium">{orderedCount} ordered</span>
				{:else}
				<span>0 ordered</span>
				{/if}
			</p>
		</div>
		<div class="flex gap-2 shrink-0">
			<button onclick={exportCSV}
				class="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				Export CSV
			</button>
			<div class="relative">
				<button type="button" aria-label="More options" aria-haspopup="true" aria-expanded={menuOpen}
					onclick={(e) => { e.stopPropagation(); menuOpen = !menuOpen; }}
					class="press inline-flex items-center justify-center w-9 h-9 border border-gray-200 hover:border-gray-300 bg-white text-gray-500 hover:text-gray-900 rounded-lg transition-colors shadow-sm">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
				</button>
				{#if menuOpen}
				<div class="animate-pop-in absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50" role="menu">
					<a href="/stores/{data.store.id}/restock/{data.session.id}/0" role="menuitem" onclick={() => (menuOpen = false)}
						class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
						Review products
					</a>
				</div>
				{/if}
			</div>
		</div>
	</div>

	{#if data.restockList.length === 0}
	<div class="bg-white border border-dashed border-gray-200 rounded-xl p-16 text-center">
		<div class="text-3xl mb-3">✓</div>
		<p class="text-sm font-medium text-gray-700">No items to restock</p>
		<p class="text-xs text-gray-400 mt-1">All variants were skipped or have 0 actual restock quantity</p>
	</div>
	{:else}
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-2xl">
		<div class="divide-y divide-gray-100">
			{#each data.restockList as item (item.id)}
			{@const isOrdered = ordered[item.id] ?? false}
			<div class="flex items-center gap-3 px-4 py-3 transition-colors {isOrdered ? 'bg-green-50/60' : 'hover:bg-gray-50'}">
				{#if (item.variantImageUrl ?? item.productImageUrl)}
				<img src={thumbUrl(item.variantImageUrl ?? item.productImageUrl)} alt=""
					class="w-11 h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
				{:else}
				<div class="w-11 h-11 rounded-lg bg-gray-100 shrink-0"></div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="text-sm font-medium text-gray-900 truncate">{item.productTitle}</div>
					{#if item.variantTitle}<div class="text-xs text-gray-500 truncate">{item.variantTitle}</div>{/if}
				</div>
				<span class="shrink-0 inline-flex items-center justify-center w-8 h-8 {isOrdered ? 'bg-green-600' : 'bg-black'} text-white text-xs font-bold rounded-lg tabular-nums transition-colors">
					{item.actualRestock}
				</span>
				<!-- Ordered toggle -->
				<form method="POST" action="?/toggleOrdered" use:enhance={() => {
					ordered[item.id] = !isOrdered;
					return async () => {};
				}}>
					<input type="hidden" name="id" value={item.id} />
					<button type="submit" title={isOrdered ? 'Mark as not ordered' : 'Mark as ordered'}
						class="press shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors
						{isOrdered ? 'border-green-300 bg-green-100 text-green-600 hover:bg-green-200' : 'border-gray-200 bg-white text-gray-300 hover:text-gray-500 hover:border-gray-300'}">
						<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
					</button>
				</form>
			</div>
			{/each}
		</div>
	</div>
	{/if}
</div>
