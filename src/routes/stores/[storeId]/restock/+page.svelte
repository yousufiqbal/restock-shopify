<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let loading = $state(false);
</script>

<svelte:head><title>{data.store.name} restock · Shopify Restock</title></svelte:head>

<div class="max-w-3xl mx-auto px-4 py-10">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">{data.store.name}</span>
	</div>

	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">{data.store.name}</h1>
			<p class="text-sm text-gray-500 mt-0.5">Restock sessions</p>
		</div>
	</div>

	<!-- Start new session -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div>
				<h2 class="text-sm font-semibold text-gray-900">New restock session</h2>
				<p class="text-xs text-gray-500 mt-0.5">Fetches all products and 90 days of sales data from Shopify</p>
			</div>
			<form method="POST" action="?/start" class="self-start" use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}}>
				<button type="submit" disabled={loading}
					class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
					{#if loading}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Fetching data…
					{:else}
						Start session
					{/if}
				</button>
			</form>
		</div>
	</div>

	<!-- Past sessions -->
	{#if data.sessions.length > 0}
	<div>
		<h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Previous sessions</h2>
		<div class="stagger bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
			{#each data.sessions as s}
			<div class="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
				<a href="/stores/{data.store.id}/restock/{s.id}/{s.completedAt ? 'complete' : s.progress.resumeIndex}"
					class="flex items-center justify-between flex-1 min-w-0">
					<div class="flex items-center gap-3">
						<div class="w-1.5 h-1.5 rounded-full {s.completedAt ? 'bg-green-400' : 'bg-amber-400'}"></div>
						<span class="text-sm text-gray-900">{new Date(s.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
						{#if s.notes}<span class="text-xs text-gray-400">{s.notes}</span>{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if !s.completedAt && s.progress.total > 0}
						<span class="text-xs text-gray-500 tabular-nums">{s.progress.done}/{s.progress.total}</span>
						{/if}
						<span class="text-xs {s.completedAt ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100'} border px-2 py-0.5 rounded-full font-medium">
							{s.completedAt ? 'Complete' : 'In progress'}
						</span>
					</div>
				</a>
				<form method="POST" action="?/delete" class="ml-3 shrink-0" use:enhance={() => {
					return async ({ update }) => { await update({ reset: false }); };
				}}>
					<input type="hidden" name="sessionId" value={s.id} />
					<button type="submit" title="Delete session"
						onclick={(e) => { if (!confirm('Delete this session? This cannot be undone.')) e.preventDefault(); }}
						class="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
						<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
					</button>
				</form>
			</div>
			{/each}
		</div>
	</div>
	{/if}
</div>
