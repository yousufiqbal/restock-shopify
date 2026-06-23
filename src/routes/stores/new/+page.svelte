<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();

	let storeType = $state<'shopify' | 'amazon'>('shopify');

	const MARKETPLACES = [
		{ id: 'A1F83G8C2ARO7P', label: 'UK (amazon.co.uk)' },
		{ id: 'ATVPDKIKX0DER', label: 'US (amazon.com)' },
		{ id: 'A1PA6795UKMFR9', label: 'DE (amazon.de)' },
		{ id: 'A13V1IB3VIYZZH', label: 'FR (amazon.fr)' },
		{ id: 'APJ6JRA9NG5V4', label: 'IT (amazon.it)' },
		{ id: 'A1RKKUPIHCS9HS', label: 'ES (amazon.es)' }
	];
</script>

<svelte:head><title>Add store · Shopify Restock</title></svelte:head>

<div class="max-w-xl mx-auto px-4 py-10">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">Add store</span>
	</div>

	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
		<!-- Store type toggle -->
		<div class="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
			<button type="button"
				onclick={() => storeType = 'shopify'}
				class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors {storeType === 'shopify' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}">
				Shopify
			</button>
			<button type="button"
				onclick={() => storeType = 'amazon'}
				class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors {storeType === 'amazon' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}">
				Amazon
			</button>
		</div>

		<h1 class="text-base font-semibold text-gray-900 mb-5">
			{storeType === 'amazon' ? 'Add Amazon store' : 'Add Shopify store'}
		</h1>

		<form method="POST" use:enhance class="space-y-4">
			<input type="hidden" name="storeType" value={storeType} />

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
			{/if}

			<div>
				<label class="block text-xs font-medium text-gray-700 mb-1.5" for="name">Store name</label>
				<input id="name" name="name" type="text" required placeholder="My Store"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
			</div>

			{#if storeType === 'shopify'}
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="domain">Shopify domain</label>
					<input id="domain" name="domain" type="text" required placeholder="mystore.myshopify.com"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="apiToken">Admin API token</label>
					<input id="apiToken" name="apiToken" type="password" required placeholder="shpat_..."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
					<p class="text-xs text-gray-400 mt-1.5">Shopify Admin → Apps → Develop apps → create app → Admin API access token</p>
				</div>
			{:else}
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="sellerId">Seller ID</label>
					<input id="sellerId" name="sellerId" type="text" required placeholder="A1B2C3EXAMPLE"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
					<p class="text-xs text-gray-400 mt-1.5">Seller Central → Account → Merchant Token</p>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="marketplaceId">Marketplace</label>
					<select id="marketplaceId" name="marketplaceId" required
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition bg-white">
						{#each MARKETPLACES as mp}
							<option value={mp.id} selected={mp.id === 'A1F83G8C2ARO7P'}>{mp.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaClientId">LWA Client ID</label>
					<input id="lwaClientId" name="lwaClientId" type="text" required placeholder="amzn1.application-oa2-client...."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaClientSecret">LWA Client Secret</label>
					<input id="lwaClientSecret" name="lwaClientSecret" type="password" required placeholder="••••••••"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="lwaRefreshToken">LWA Refresh Token</label>
					<input id="lwaRefreshToken" name="lwaRefreshToken" type="password" required placeholder="Atzr|..."
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
					<p class="text-xs text-gray-400 mt-1.5">
						Get these from Seller Central → Apps & Services → Develop Apps → your SP-API app
					</p>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="airLeadDays">✈ Air lead days</label>
					<input id="airLeadDays" name="airLeadDays" type="number" value="15" min="1" max="365"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1.5" for="seaLeadDays">🚢 Sea lead days</label>
					<input id="seaLeadDays" name="seaLeadDays" type="number" value="60" min="1" max="365"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>
			</div>

			<div class="pt-2 flex gap-2">
				<button type="submit" class="bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
					Add store
				</button>
				<a href="/stores" class="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-block">
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
