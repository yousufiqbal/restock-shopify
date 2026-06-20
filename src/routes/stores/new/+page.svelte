<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<div class="max-w-xl mx-auto px-4 py-10">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">Add store</span>
	</div>

	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
		<h1 class="text-base font-semibold text-gray-900 mb-5">Add Shopify store</h1>

		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
			{/if}
			<div>
				<label class="block text-xs font-medium text-gray-700 mb-1.5" for="name">Store name</label>
				<input id="name" name="name" type="text" required placeholder="My Store"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
			</div>
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
