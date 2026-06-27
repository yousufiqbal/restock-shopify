<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let applying = $state(false);

	function thumbUrl(url: string | null | undefined): string {
		if (!url) return '';
		return url.includes('cdn.shopify.com') ? `${url}?width=88` : url;
	}
</script>

<svelte:head><title>Inventory Review · {data.store.name}</title></svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="bg-white border-b border-gray-200 sticky top-0 z-40">
		<div class="max-w-2xl mx-auto px-4 flex items-center justify-between gap-4 py-3">
			<a href="/stores/{data.store.id}/inventory/{data.session.id}/0"
				class="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
				Back
			</a>
			<span class="text-sm font-medium text-gray-700">
				{data.checkedItems.length} {data.checkedItems.length === 1 ? 'variant' : 'variants'} adjusted
			</span>
			<form method="POST" action="?/apply" use:enhance={() => {
				applying = true;
				return async ({ update }) => { await update({ reset: false }); applying = false; };
			}}>
				<button type="submit" disabled={applying || data.checkedItems.length === 0}
					class="press inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap">
					{#if applying}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Applying…
					{:else}
						Apply to Shopify
					{/if}
				</button>
			</form>
		</div>
	</div>

	<div class="max-w-2xl mx-auto px-4 py-6">
		{#if form?.success}
		<div class="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-800">
			<svg class="w-4 h-4 text-green-600 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
			{form.applied} variants updated in Shopify.
		</div>
		{/if}

		{#if form && !form.success && form.errors}
		<div class="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
			<p class="font-medium mb-1">Some updates failed ({form.errors.length}):</p>
			<ul class="list-disc list-inside space-y-0.5 text-xs text-red-700">
				{#each form.errors as err}<li>{err}</li>{/each}
			</ul>
			{#if form.applied > 0}<p class="mt-1 text-green-700">{form.applied} variants applied successfully.</p>{/if}
		</div>
		{/if}

		{#if data.checkedItems.length === 0}
		<div class="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
			<p class="text-sm text-gray-500">No items counted yet. Go through the session to enter stock counts.</p>
			<a href="/stores/{data.store.id}/inventory/{data.session.id}/0"
				class="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
				Start counting
			</a>
		</div>
		{:else}
		<div class="mb-3">
			<h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
				Adjusted ({data.checkedItems.length})
			</h2>
		</div>
		<div class="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden mb-6">
			{#each data.checkedItems as item}
			<div class="flex items-center gap-3 px-4 py-3">
				{#if item.variantImageUrl || item.productImageUrl}
				<img src={thumbUrl(item.variantImageUrl ?? item.productImageUrl)} alt=""
					class="w-9 h-9 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
				{:else}
				<div class="w-9 h-9 rounded-lg bg-gray-100 shrink-0"></div>
				{/if}
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium text-gray-900 truncate">{item.productTitle}</div>
					{#if item.variantTitle}<div class="text-xs text-gray-500">{item.variantTitle}</div>{/if}
				</div>
				<!-- Old → New -->
				<div class="flex items-center gap-2 shrink-0 text-sm tabular-nums">
					<span class="text-gray-400">{item.currentStock}</span>
					<svg class="w-3.5 h-3.5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
					<span class="font-semibold {item.newStock! > item.currentStock ? 'text-green-700' : item.newStock! < item.currentStock ? 'text-red-600' : 'text-gray-700'}">{item.newStock}</span>
					{#if item.newStock! !== item.currentStock}
					<span class="text-xs {item.newStock! > item.currentStock ? 'text-green-600' : 'text-red-500'}">
						({item.newStock! > item.currentStock ? '+' : ''}{item.newStock! - item.currentStock})
					</span>
					{/if}
				</div>
			</div>
			{/each}
		</div>

		{/if}
	</div>
</div>
