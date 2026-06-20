<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showAdd = $state(false);
</script>

<div class="min-h-screen bg-gray-950 p-4 md:p-8">
	<div class="max-w-3xl mx-auto">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-2xl font-bold text-white">Stores</h1>
			<button
				onclick={() => (showAdd = !showAdd)}
				class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
			>
				+ Add Store
			</button>
		</div>

		{#if showAdd}
		<form method="POST" action="?/add" use:enhance class="bg-gray-900 rounded-xl p-6 mb-6 space-y-4">
			{#if form?.error}
				<div class="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">{form.error}</div>
			{/if}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="name">Store Name</label>
					<input id="name" name="name" type="text" required placeholder="My Store"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="domain">Shopify Domain</label>
					<input id="domain" name="domain" type="text" required placeholder="mystore.myshopify.com"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
				<div class="md:col-span-2">
					<label class="block text-sm text-gray-400 mb-1" for="apiToken">Admin API Token</label>
					<input id="apiToken" name="apiToken" type="password" required placeholder="shpat_..."
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="airLeadDays">Air Lead Days</label>
					<input id="airLeadDays" name="airLeadDays" type="number" value="15" min="1" max="365"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="seaLeadDays">Sea Lead Days</label>
					<input id="seaLeadDays" name="seaLeadDays" type="number" value="60" min="1" max="365"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
			</div>
			<div class="flex gap-3">
				<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
					Save Store
				</button>
				<button type="button" onclick={() => (showAdd = false)} class="text-gray-400 hover:text-white text-sm px-3 py-2 transition">
					Cancel
				</button>
			</div>
		</form>
		{/if}

		{#if data.stores.length === 0}
		<div class="text-center py-16 text-gray-500">
			<div class="text-4xl mb-3">🏪</div>
			<p>No stores yet. Add your first Shopify store above.</p>
		</div>
		{:else}
		<div class="space-y-3">
			{#each data.stores as store}
			<div class="bg-gray-900 rounded-xl p-5 flex items-center justify-between gap-4">
				<div class="min-w-0">
					<div class="font-semibold text-white">{store.name}</div>
					<div class="text-sm text-gray-400 truncate">{store.domain}</div>
					<div class="text-xs text-gray-500 mt-1">Air: {store.airLeadDays}d &nbsp;·&nbsp; Sea: {store.seaLeadDays}d</div>
				</div>
				<div class="flex items-center gap-2 shrink-0">
					<a href="/stores/{store.id}/settings" class="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition">
						Settings
					</a>
					<a href="/stores/{store.id}/restock" class="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">
						Restock
					</a>
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={store.id} />
						<button type="submit"
							onclick={(e) => { if (!confirm('Delete this store?')) e.preventDefault(); }}
							class="text-gray-500 hover:text-red-400 transition p-1.5">✕</button>
					</form>
				</div>
			</div>
			{/each}
		</div>
		{/if}
	</div>
</div>
