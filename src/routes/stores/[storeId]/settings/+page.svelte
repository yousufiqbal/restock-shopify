<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	const MARKETPLACES = [
		{ id: 'A1F83G8C2ARO7P', label: 'UK (amazon.co.uk)' },
		{ id: 'ATVPDKIKX0DER', label: 'US (amazon.com)' },
		{ id: 'A1PA6795UKMFR9', label: 'DE (amazon.de)' },
		{ id: 'A13V1IB3VIYZZH', label: 'FR (amazon.fr)' },
		{ id: 'APJ6JRA9NG5V4', label: 'IT (amazon.it)' },
		{ id: 'A1RKKUPIHCS9HS', label: 'ES (amazon.es)' }
	];
</script>

<svelte:head><title>{data.store.name} settings · Shopify Restock</title></svelte:head>

<div class="max-w-xl mx-auto px-4 py-10 space-y-6">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">{data.store.name}</span>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900">Settings</span>
	</div>

	<!-- Main settings -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
		<div class="flex items-center gap-2 mb-5">
			<h1 class="text-base font-semibold text-gray-900">Store settings</h1>
			<span class="text-xs font-medium px-2 py-0.5 rounded-full {data.store.storeType === 'amazon' ? 'bg-[#FF9900]/10 text-[#c47800]' : 'bg-green-50 text-green-700'}">
				{data.store.storeType === 'amazon' ? 'Amazon' : 'Shopify'}
			</span>
		</div>

		<form method="POST" action="?/save" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
			{/if}
			<div>
				<label class="block text-xs font-medium text-gray-700 mb-1.5" for="name">Store name</label>
				<input id="name" name="name" type="text" required value={data.store.name}
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
			</div>

			{#if data.store.storeType === 'amazon'}
				<div>
					<p class="block text-xs font-medium text-gray-700 mb-1.5">Seller ID</p>
					<div class="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 font-mono">{data.store.domain}</div>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="marketplaceId">Marketplace</label>
					<select id="marketplaceId" name="marketplaceId"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition bg-white">
						{#each MARKETPLACES as mp}
							<option value={mp.id} selected={mp.id === data.store.marketplaceId}>{mp.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaClientId">
						LWA Client ID <span class="text-gray-400 font-normal">(leave blank to keep current)</span>
					</label>
					<input id="lwaClientId" name="lwaClientId" type="text" placeholder="amzn1.application-oa2-client...."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaClientSecret">
						LWA Client Secret <span class="text-gray-400 font-normal">(leave blank to keep current)</span>
					</label>
					<input id="lwaClientSecret" name="lwaClientSecret" type="password" placeholder="••••••••"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaRefreshToken">
						LWA Refresh Token <span class="text-gray-400 font-normal">(leave blank to keep current)</span>
					</label>
					<input id="lwaRefreshToken" name="lwaRefreshToken" type="password" placeholder="Atzr|..."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
			{:else}
				<div>
					<p class="block text-xs font-medium text-gray-700 mb-1.5">Shopify domain</p>
					<div class="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 font-mono">{data.store.domain}</div>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="apiToken">
						Admin API token <span class="text-gray-400 font-normal">(leave blank to keep current)</span>
					</label>
					<input id="apiToken" name="apiToken" type="password" placeholder="shpat_..."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="airLeadDays">✈ Air lead days</label>
					<input id="airLeadDays" name="airLeadDays" type="number" value={data.store.airLeadDays} min="1" max="365"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="seaLeadDays">🚢 Sea lead days</label>
					<input id="seaLeadDays" name="seaLeadDays" type="number" value={data.store.seaLeadDays} min="1" max="365"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
			</div>
			<div class="pt-2 flex gap-2">
				<button type="submit" class="bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
					Save changes
				</button>
				<a href="/stores" class="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-block">
					Cancel
				</a>
			</div>
		</form>
	</div>

	<!-- Danger zone -->
	<div class="bg-white border border-red-200 rounded-xl shadow-sm p-6">
		<h2 class="text-sm font-semibold text-red-700 mb-1">Danger zone</h2>
		<p class="text-xs text-gray-500 mb-4">Permanently delete this store and all its restock sessions and data. This cannot be undone.</p>
		<form method="POST" action="?/delete" use:enhance>
			<button type="submit"
				onclick={(e) => {
					if (!confirm(`Delete "${data.store.name}" and ALL its data permanently? Type OK to confirm.`)) e.preventDefault();
				}}
				class="border border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
				Delete store
			</button>
		</form>
	</div>
</div>
