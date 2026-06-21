<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let saving = $state(false);
	let formEl = $state<HTMLFormElement>();
	let toast = $state(false);
	let toastTimer: ReturnType<typeof setTimeout>;

	function showToast() {
		toast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = false), 2200);
	}

	// Persist current edits in the background, navigate immediately — the save
	// round-trip and the next page's load happen concurrently, not chained.
	function navTo(targetIndex: number) {
		if (formEl) {
			// fire-and-forget; the fetch survives the SPA navigation
			fetch('?/save', { method: 'POST', body: new FormData(formEl) }).catch(() => {});
		}
		goto(`../${data.session.id}/${targetIndex}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement) return;
		const { prevIndex, nextIndex } = data;
		if (e.key === 'ArrowLeft' && prevIndex !== null) navTo(prevIndex);
		if (e.key === 'ArrowRight' && nextIndex !== null) navTo(nextIndex);
	}

	const progress = ((data.index + 1) / data.totalProducts) * 100;
</script>

<svelte:head><title>{data.index + 1}/{data.totalProducts} {data.productTitle} · Shopify Restock</title></svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Progress bar header -->
	<div class="bg-white border-b border-gray-200 sticky top-0 z-40">
		<div class="h-0.5 bg-gray-100">
			<div class="h-full bg-black transition-all duration-300 ease-out" style="width: {progress}%"></div>
		</div>
		<div class="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4 py-3">
			<a href="/stores/{data.store.id}/restock" class="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
				{data.store.name}
			</a>
			<div class="text-sm font-medium text-gray-700">
				<span class="text-gray-900 font-semibold">{data.index + 1}</span>
				<span class="text-gray-400"> / {data.totalProducts}</span>
			</div>
			{#if data.session.completedAt}
			<a href="/stores/{data.store.id}/restock/{data.session.id}/complete"
				class="press inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
				Restock list
				<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
			</a>
			{:else}
			<div class="text-xs text-gray-400 hidden md:block">← → keys to navigate</div>
			{/if}
		</div>
	</div>

	{#key data.index}
	<div class="animate-fade-in-up flex-1 max-w-5xl mx-auto w-full px-4 py-6">
		<!-- Product header -->
		<div class="flex items-center gap-4 mb-5">
			{#if data.productImageUrl}
				<img src={data.productImageUrl} alt={data.productTitle}
					class="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-100" />
			{/if}
			<div>
				<h1 class="text-xl font-semibold text-gray-900 leading-tight">{data.productTitle}</h1>
				<p class="text-xs text-gray-400 mt-0.5">{data.variants.length} variant{data.variants.length > 1 ? 's' : ''} / <span class="text-gray-500 font-medium">{data.variants.reduce((s, v) => s + v.sales90, 0)}</span> sold in 90d</p>
			</div>
		</div>

		<form method="POST" action="?/save" bind:this={formEl} use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				await update({ reset: false });
				saving = false;
				if (result.type === 'success') showToast();
			};
		}}>
			<!-- Single card containing all variants as rows -->
			<div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-5">
				<!-- Column headers -->
				<div class="hidden lg:grid grid-cols-[200px_1fr_148px_120px] gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
					<span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Variant</span>
					<div class="flex gap-2">
						<span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[52px] text-center">90d</span>
						<span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[52px] text-center">30d</span>
						<span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[52px] text-center">Stock</span>
					</div>
					<span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Restock qty</span>
					<div class="flex gap-2">
						<span class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide w-[52px] text-center">✈ Air</span>
						<span class="text-[11px] font-semibold text-teal-500 uppercase tracking-wide w-[52px] text-center">🚢 Sea</span>
					</div>
				</div>

				<div class="divide-y divide-gray-100">
					{#each data.variants as v}
					<div class="p-4 lg:grid lg:grid-cols-[200px_1fr_148px_120px] lg:items-center lg:gap-4">
						<!-- Mobile: name row -->
						<div class="flex items-center gap-3 shrink-0 mb-2 lg:mb-0">
							{#if v.variantImageUrl}
								<img src={v.variantImageUrl} alt={v.variantTitle ?? ''}
									class="w-9 h-9 lg:w-11 lg:h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
							{:else if v.productImageUrl}
								<img src={v.productImageUrl} alt={v.variantTitle ?? ''}
									class="w-9 h-9 lg:w-11 lg:h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0 opacity-40" />
							{:else}
								<div class="w-9 h-9 lg:w-11 lg:h-11 rounded-lg bg-gray-100 shrink-0"></div>
							{/if}
							<div>
								<div class="text-sm font-medium text-gray-900">{v.variantTitle ?? 'Default'}</div>
								{#if v.sku}<div class="text-xs text-gray-400 font-mono">{v.sku}</div>{/if}
							</div>
						</div>

						<!-- Mobile: stats + counter stacked; Desktop: inline grid -->
						<div class="lg:contents">
							<!-- Stats — 5 fixed columns on mobile (no scroll/wrap); flex of 3 on desktop -->
							<div class="grid grid-cols-5 gap-1.5 lg:flex lg:gap-2 mb-2 lg:mb-0">
								<div class="flex flex-col items-center justify-center border border-gray-100 rounded-lg px-1 py-1.5 min-w-0 lg:min-w-[52px] lg:px-3">
									<span class="text-[9px] text-gray-400 font-medium uppercase tracking-wide lg:hidden">90d</span>
									<span class="text-sm font-semibold text-gray-900 tabular-nums">{v.sales90}</span>
								</div>
								<div class="flex flex-col items-center justify-center border border-gray-100 rounded-lg px-1 py-1.5 min-w-0 lg:min-w-[52px] lg:px-3">
									<span class="text-[9px] text-gray-400 font-medium uppercase tracking-wide lg:hidden">30d</span>
									<span class="text-sm font-semibold text-gray-900 tabular-nums">{v.sales30}</span>
								</div>
								<div class="flex flex-col items-center justify-center border rounded-lg px-1 py-1.5 min-w-0 lg:min-w-[52px] lg:px-3 {v.currentStock === 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}">
									<span class="text-[9px] {v.currentStock === 0 ? 'text-red-400' : 'text-gray-400'} font-medium uppercase tracking-wide lg:hidden">Stock</span>
									<span class="text-sm font-semibold tabular-nums {v.currentStock === 0 ? 'text-red-600' : 'text-gray-900'}">{v.currentStock}</span>
								</div>
								<div class="flex flex-col items-center justify-center border border-blue-100 bg-blue-50 rounded-lg px-1 py-1.5 min-w-0 lg:hidden">
									<span class="text-[9px] text-blue-500 font-medium uppercase tracking-wide">✈Air</span>
									<span class="text-sm font-semibold text-blue-700 tabular-nums">{v.recAir}</span>
								</div>
								<div class="flex flex-col items-center justify-center border border-teal-100 bg-teal-50 rounded-lg px-1 py-1.5 min-w-0 lg:hidden">
									<span class="text-[9px] text-teal-500 font-medium uppercase tracking-wide">🚢Sea</span>
									<span class="text-sm font-semibold text-teal-700 tabular-nums">{v.recSea}</span>
								</div>
							</div>

						<!-- Restock qty -->
						<div class="shrink-0">
							<div class="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit focus-within:ring-2 focus-within:ring-black/10 focus-within:border-gray-500 transition">
								<button type="button" aria-label="Decrease"
									onclick={(e) => {
										const input = e.currentTarget.nextElementSibling as HTMLInputElement;
										const val = parseInt(input.value || '0', 10);
										if (val > 0) input.value = String(val - 1);
									}}
									class="px-3 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg leading-none select-none border-r border-gray-200">−</button>
								<input
									type="number"
									name="actualRestock_{v.id}"
									value={v.actualRestock ?? ''}
									min="0"
									placeholder="0"
									class="w-14 text-gray-900 py-2 text-center text-base font-semibold focus:outline-none placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
								<button type="button" aria-label="Increase"
									onclick={(e) => {
										const input = e.currentTarget.previousElementSibling as HTMLInputElement;
										const val = parseInt(input.value || '0', 10);
										input.value = String(val + 1);
									}}
									class="px-3 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg leading-none select-none border-l border-gray-200">+</button>
							</div>
						</div>

						<!-- Air / Sea — desktop only column -->
						<div class="hidden lg:flex gap-2">
							<div class="flex flex-col items-center border border-blue-100 bg-blue-50 rounded-lg px-3 py-1.5 shrink-0 min-w-[52px]">
								<span class="text-sm font-semibold text-blue-700">{v.recAir}</span>
							</div>
							<div class="flex flex-col items-center border border-teal-100 bg-teal-50 rounded-lg px-3 py-1.5 shrink-0 min-w-[52px]">
								<span class="text-sm font-semibold text-teal-700">{v.recSea}</span>
							</div>
						</div>
					</div> <!-- end lg:contents -->
					</div>
					{/each}
				</div>
			</div>

			<!-- Navigation -->
			<div class="flex items-center justify-between gap-3">
				{#if data.prevIndex !== null}
				<button type="button" onclick={() => navTo(data.prevIndex!)}
					class="press inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 bg-white disabled:opacity-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
					Previous
				</button>
				{:else}
				<button type="button" disabled aria-disabled="true"
					class="inline-flex items-center gap-2 border border-gray-200 text-gray-300 bg-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm cursor-not-allowed">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
					Previous
				</button>
				{/if}

				<button type="submit" disabled={saving}
					class="press inline-flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 bg-white disabled:opacity-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
					{#if saving}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
					{/if}
					Save
				</button>

				{#if data.nextIndex !== null}
				<button type="button" onclick={() => navTo(data.nextIndex!)}
					class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white disabled:opacity-50 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
					Next
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
				</button>
				{:else}
				<button type="submit" formaction="?/complete" disabled={saving}
					onclick={() => { if (formEl) fetch('?/save', { method: 'POST', body: new FormData(formEl) }).catch(() => {}); }}
					class="press inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
					{#if saving}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
					{:else}
						Complete
						<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
					{/if}
				</button>
				{/if}
			</div>
		</form>
	</div>
	{/key}
</div>

{#if toast}
<div class="animate-fade-in-up fixed top-5 right-5 z-50 flex items-center gap-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg">
	<svg class="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
	Restock quantities saved
</div>
{/if}
