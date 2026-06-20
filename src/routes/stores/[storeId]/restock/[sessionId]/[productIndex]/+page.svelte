<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function navigate(index: number | null) {
		if (index === null) return;
		goto(`../${data.session.id}/${index}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement) return;
		if (e.key === 'ArrowLeft' && data.prevIndex !== null) navigate(data.prevIndex);
		if (e.key === 'ArrowRight' && data.nextIndex !== null) navigate(data.nextIndex);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-950 flex flex-col">
	<!-- Top bar -->
	<div class="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-4">
		<a href="/stores/{data.store.id}/restock" class="text-gray-400 hover:text-white text-sm transition shrink-0">
			← {data.store.name}
		</a>
		<div class="text-center">
			<div class="text-white font-semibold text-sm">{data.index + 1} of {data.totalProducts} products</div>
			<div class="w-48 md:w-64 bg-gray-700 rounded-full h-1.5 mt-1 mx-auto">
				<div class="bg-blue-500 h-1.5 rounded-full transition-all"
					style="width: {((data.index + 1) / data.totalProducts) * 100}%"></div>
			</div>
		</div>
		<div class="text-xs text-gray-500 shrink-0 hidden md:block">← → to navigate</div>
	</div>

	<!-- Main content -->
	<div class="flex-1 p-4 md:p-6">
		<div class="max-w-4xl mx-auto">
			<!-- Product header -->
			<div class="flex items-center gap-4 mb-6">
				{#if data.productImageUrl}
				<img src={data.productImageUrl} alt={data.productTitle}
					class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl shrink-0 bg-gray-800" />
				{/if}
				<h1 class="text-xl md:text-2xl font-bold text-white">{data.productTitle}</h1>
			</div>

			<!-- Variants form -->
			<form method="POST" action="?/save" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
				return async ({ update }) => {
					await update({ reset: false });
					// Navigate to next after save if submitter has data-next
					if (submitter?.dataset.next) {
						const idx = parseInt(submitter.dataset.next, 10);
						goto(`../${data.session.id}/${idx}`);
					}
				};
			}}>
				<div class="space-y-3">
					{#each data.variants as v}
					<div class="bg-gray-900 rounded-xl p-4 md:p-5">
						<div class="flex flex-col md:flex-row md:items-center gap-4">
							<!-- Variant image + name -->
							<div class="flex items-center gap-3 md:w-48 shrink-0">
								{#if v.variantImageUrl}
								<img src={v.variantImageUrl} alt={v.variantTitle ?? v.productTitle}
									class="w-12 h-12 object-cover rounded-lg bg-gray-800 shrink-0" />
								{:else}
								<div class="w-12 h-12 rounded-lg bg-gray-800 shrink-0"></div>
								{/if}
								<div class="min-w-0">
									<div class="text-white font-medium text-sm">{v.variantTitle ?? 'Default'}</div>
									{#if v.sku}<div class="text-gray-500 text-xs">{v.sku}</div>{/if}
								</div>
							</div>

							<!-- Sales + stock stats -->
							<div class="flex flex-wrap gap-2 flex-1">
								<div class="bg-gray-800 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
									<div class="text-xs text-gray-400">30d</div>
									<div class="text-white font-semibold">{v.sales30}</div>
								</div>
								<div class="bg-gray-800 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
									<div class="text-xs text-gray-400">60d</div>
									<div class="text-white font-semibold">{v.sales60}</div>
								</div>
								<div class="bg-gray-800 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
									<div class="text-xs text-gray-400">90d</div>
									<div class="text-white font-semibold">{v.sales90}</div>
								</div>
								<div class="bg-gray-800 rounded-lg px-3 py-1.5 text-center min-w-[60px] {v.currentStock === 0 ? 'border border-red-600' : ''}">
									<div class="text-xs text-gray-400">Stock</div>
									<div class="font-semibold {v.currentStock === 0 ? 'text-red-400' : 'text-white'}">{v.currentStock}</div>
								</div>
								<div class="bg-blue-950 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
									<div class="text-xs text-blue-400">✈ Air</div>
									<div class="text-blue-300 font-semibold">{v.recAir}</div>
								</div>
								<div class="bg-teal-950 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
									<div class="text-xs text-teal-400">🚢 Sea</div>
									<div class="text-teal-300 font-semibold">{v.recSea}</div>
								</div>
							</div>

							<!-- Restock input + skip -->
							<div class="flex items-center gap-3 md:w-40 shrink-0">
								<input
									type="number"
									name="actualRestock_{v.id}"
									value={v.actualRestock ?? ''}
									min="0"
									placeholder="Qty"
									class="w-24 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none text-center font-semibold text-lg"
								/>
								<label class="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer whitespace-nowrap">
									<input type="checkbox" name="skip_{v.id}" checked={v.skip}
										class="rounded bg-gray-700 border-gray-600 accent-gray-500" />
									Skip
								</label>
							</div>
						</div>
					</div>
					{/each}
				</div>

				<!-- Navigation -->
				<div class="flex items-center justify-between mt-6 gap-3">
					{#if data.prevIndex !== null}
					<button type="submit" data-next={data.prevIndex}
						class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl font-medium transition">
						← Prev
					</button>
					{:else}
					<div></div>
					{/if}

					<button type="submit"
						class="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium transition">
						Save
					</button>

					{#if data.nextIndex !== null}
					<button type="submit" data-next={data.nextIndex}
						class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium transition">
						Next →
					</button>
					{:else}
					<button type="submit" formaction="?/complete"
						class="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-medium transition">
						Complete ✓
					</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
</div>
