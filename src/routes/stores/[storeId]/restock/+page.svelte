<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let loading = $state(false);
</script>

<div class="min-h-screen bg-gray-950 p-4 md:p-8">
	<div class="max-w-2xl mx-auto">
		<div class="flex items-center gap-3 mb-6">
			<a href="/stores" class="text-gray-400 hover:text-white transition">← Stores</a>
			<span class="text-gray-600">/</span>
			<h1 class="text-xl font-bold text-white">{data.store.name}</h1>
		</div>

		<form method="POST" action="?/start" use:enhance={() => {
			loading = true;
			return async ({ update }) => { await update(); loading = false; };
		}}>
			<button type="submit" disabled={loading}
				class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-4 rounded-xl font-semibold text-lg transition mb-8">
				{loading ? 'Fetching products & sales data…' : '+ Start New Restock Session'}
			</button>
		</form>

		{#if data.sessions.length > 0}
		<h2 class="text-lg font-semibold text-white mb-3">Previous Sessions</h2>
		<div class="space-y-2">
			{#each data.sessions as s}
			<a href="/stores/{data.store.id}/restock/{s.id}/0"
				class="flex items-center justify-between bg-gray-900 hover:bg-gray-800 rounded-xl px-5 py-4 transition">
				<div>
					<div class="text-white text-sm font-medium">{new Date(s.startedAt).toLocaleDateString()}</div>
					{#if s.notes}<div class="text-gray-400 text-xs">{s.notes}</div>{/if}
				</div>
				<div class="text-xs {s.completedAt ? 'text-green-400' : 'text-yellow-400'}">
					{s.completedAt ? '✓ Complete' : 'In Progress'}
				</div>
			</a>
			{/each}
		</div>
		{/if}
	</div>
</div>
