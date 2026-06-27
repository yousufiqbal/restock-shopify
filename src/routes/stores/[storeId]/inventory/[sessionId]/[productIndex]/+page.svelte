<script lang="ts" module>
	type ProductRef = { index: number; title: string; done: boolean };
	const sessionDone = new Map<string, Set<number>>();
	const productsCache = new Map<string, ProductRef[]>();
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, preloadData } from '$app/navigation';

	let { data } = $props();
	let saving = $state(false);
	let doneVersion = $state(0);

	function markDoneLocal(index: number) {
		let set = sessionDone.get(data.session.id);
		if (!set) sessionDone.set(data.session.id, (set = new Set()));
		set.add(index);
		doneVersion++;
	}

	function localDone(index: number) {
		return sessionDone.get(data.session.id)?.has(index) ?? false;
	}

	let formEl = $state<HTMLFormElement>();
	let toast = $state(false);
	let toastTimer: ReturnType<typeof setTimeout>;

	let jumpOpen = $state(false);
	let jumpQuery = $state('');
	let products = $state<ProductRef[]>(productsCache.get(data.session.id) ?? []);

	$effect(() => {
		const sid = data.session.id;
		const cached = productsCache.get(sid);
		if (cached) { products = cached; return; }
		fetch(`/stores/${data.store.id}/inventory/${sid}/products`)
			.then((r) => r.json())
			.then((d: { products: ProductRef[] }) => { productsCache.set(sid, d.products); products = d.products; })
			.catch(() => {});
	});

	const productsView = $derived.by(() => {
		doneVersion;
		return products.map((p) => ({ ...p, done: p.done || localDone(p.index) }));
	});
	const doneCount = $derived(productsView.filter((p) => p.done).length);
	const filteredProducts = $derived.by(() => {
		const q = jumpQuery.trim().toLowerCase();
		return q ? productsView.filter((p) => p.title.toLowerCase().includes(q)) : productsView;
	});

	function jumpTo(index: number) {
		jumpOpen = false;
		jumpQuery = '';
		if (index !== data.index) navTo(index);
	}

	function showToast() {
		toast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = false), 2200);
	}

	function saveForm(markDone: boolean) {
		if (!formEl) return;
		const body = new FormData(formEl);
		if (markDone) {
			for (const [key, value] of [...body.entries()]) {
				if (key.startsWith('newStock_') && value === '') body.set(key, String(data.variants.find(v => `newStock_${v.id}` === key)?.currentStock ?? 0));
			}
			markDoneLocal(data.index);
		}
		fetch('?/save', { method: 'POST', body }).catch(() => {});
	}

	function navTo(targetIndex: number, markDone = false) {
		saveForm(markDone);
		goto(`../${data.session.id}/${targetIndex}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement) return;
		const { prevIndex, nextIndex } = data;
		if (e.key === 'ArrowLeft' && prevIndex !== null) navTo(prevIndex);
		if (e.key === 'ArrowRight' && nextIndex !== null) navTo(nextIndex, true);
	}

	const progress = ((data.index + 1) / data.totalProducts) * 100;

	$effect(() => {
		const base = `/stores/${data.store.id}/inventory/${data.session.id}`;
		if (data.nextIndex !== null) preloadData(`${base}/${data.nextIndex}`);
		if (data.prevIndex !== null) preloadData(`${base}/${data.prevIndex}`);
	});
</script>

<svelte:head><title>{data.index + 1}/{data.totalProducts} {data.productTitle} · Inventory</title></svelte:head>
<svelte:window onkeydown={handleKeydown} onclick={() => { if (jumpOpen) jumpOpen = false; }} />

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Progress bar header -->
	<div class="bg-white border-b border-gray-200 sticky top-0 z-40">
		<div class="h-0.5 bg-gray-100">
			<div class="h-full bg-indigo-600 transition-all duration-300 ease-out" style="width: {progress}%"></div>
		</div>
		<div class="max-w-2xl mx-auto px-4 flex items-center justify-between gap-4 py-3">
			<a href="/stores/{data.store.id}/inventory" class="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
				{data.store.name}
			</a>
			<div class="relative">
				<button type="button" aria-haspopup="true" aria-expanded={jumpOpen}
					onclick={(e) => { e.stopPropagation(); jumpOpen = !jumpOpen; }}
					class="press inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 px-2.5 py-1 rounded-lg transition-colors">
					<span><span class="text-gray-900 font-semibold">{data.index + 1}</span><span class="text-gray-400"> / {data.totalProducts}</span></span>
					<span class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full tabular-nums">{doneCount} done</span>
					<svg class="w-3.5 h-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
				</button>

				{#if jumpOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="animate-pop-in fixed sm:absolute left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 top-16 sm:top-auto sm:mt-2 sm:w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
					onclick={(e) => e.stopPropagation()} role="menu" tabindex="-1">
					<div class="p-2 border-b border-gray-100">
						<!-- svelte-ignore a11y_autofocus -->
						<input bind:value={jumpQuery} type="text" placeholder="Jump to product…" autofocus
							class="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
					</div>
					<div class="max-h-72 overflow-y-auto py-1">
						{#each filteredProducts as p}
						<button type="button" onclick={() => jumpTo(p.index)}
							class="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors {p.index === data.index ? 'bg-gray-50 font-medium' : ''}">
							{#if p.done}
							<svg class="w-3.5 h-3.5 text-indigo-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							{:else}
							<span class="w-3.5 h-3.5 shrink-0 rounded-full border border-gray-200"></span>
							{/if}
							<span class="text-gray-400 tabular-nums text-xs w-7 shrink-0">{p.index + 1}</span>
							<span class="truncate text-gray-800">{p.title}</span>
						</button>
						{:else}
						<div class="px-3 py-4 text-center text-sm text-gray-400">No match</div>
						{/each}
					</div>
				</div>
				{/if}
			</div>
			<div class="text-xs text-gray-400 hidden md:block">← → keys to navigate</div>
		</div>
	</div>

	{#key data.index}
	<div class="animate-fade-in-up flex-1 max-w-2xl mx-auto w-full px-4 py-6">
		<!-- Product header -->
		<div class="flex items-center gap-4 mb-5">
			{#if data.productImageUrl}
				<img src={data.productImageUrl} alt={data.productTitle}
					class="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-100" />
			{/if}
			<div>
				<h1 class="text-xl font-semibold text-gray-900 leading-tight">{data.productTitle}</h1>
				<p class="text-xs text-gray-400 mt-0.5">{data.variants.length} variant{data.variants.length > 1 ? 's' : ''}</p>
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
			<div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-5">
				<div class="divide-y divide-gray-100">
					{#each data.variants as v}
					<div class="p-4 flex items-center gap-4">
						<!-- Image + title -->
						<div class="flex items-center gap-3 flex-1 min-w-0">
							{#if v.variantImageUrl}
								<img src={v.variantImageUrl} alt={v.variantTitle ?? ''}
									class="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
							{:else if v.productImageUrl}
								<img src={v.productImageUrl} alt={v.variantTitle ?? ''}
									class="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0 opacity-40" />
							{:else}
								<div class="w-10 h-10 rounded-lg bg-gray-100 shrink-0"></div>
							{/if}
							<div class="min-w-0">
								<div class="text-sm font-medium text-gray-900 truncate">{v.variantTitle ?? 'Default'}</div>
								{#if v.sku}<div class="text-xs text-gray-400 font-mono">{v.sku}</div>{/if}
							</div>
						</div>

						<!-- Current stock (Shopify snapshot) -->
						<div class="flex flex-col items-center shrink-0">
							<span class="text-base font-semibold tabular-nums {v.currentStock === 0 ? 'text-red-600' : 'text-gray-700'}">{v.currentStock}</span>
						</div>

						<!-- Arrow -->
						<svg class="w-4 h-4 text-gray-300 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>

						<!-- New stock input -->
						<div class="shrink-0">
							<div class="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition">
								<button type="button" aria-label="Decrease"
									onclick={(e) => {
										const input = e.currentTarget.nextElementSibling as HTMLInputElement;
										const val = parseInt(input.value !== '' ? input.value : String(v.currentStock), 10);
										if (val > 0) input.value = String(val - 1);
										else input.value = '0';
									}}
									class="px-3 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg leading-none select-none border-r border-gray-200">−</button>
								<input
									type="number"
									name="newStock_{v.id}"
									value={v.newStock ?? ''}
									min="0"
									placeholder={String(v.currentStock)}
									class="w-14 text-gray-900 py-2 text-center text-base font-semibold focus:outline-none placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
								<button type="button" aria-label="Increase"
									onclick={(e) => {
										const input = e.currentTarget.previousElementSibling as HTMLInputElement;
										const val = parseInt(input.value !== '' ? input.value : String(v.currentStock), 10);
										input.value = String(val + 1);
									}}
									class="px-3 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg leading-none select-none border-l border-gray-200">+</button>
							</div>
						</div>
					</div>
					{/each}
				</div>
			</div>

			<!-- Navigation -->
			<div class="flex items-center justify-between gap-3">
				{#if data.prevIndex !== null}
				<button type="button" onclick={() => navTo(data.prevIndex!)}
					class="press inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
					Previous
				</button>
				{:else}
				<button type="button" disabled
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
				<button type="button" onclick={() => navTo(data.nextIndex!, true)}
					class="press inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
					Next
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
				</button>
				{:else}
				<button type="submit" formaction="?/complete" disabled={saving}
					onclick={() => saveForm(true)}
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
	Saved
</div>
{/if}
