<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-gray-950 p-4 md:p-8">
	<div class="max-w-xl mx-auto">
		<div class="flex items-center gap-3 mb-6">
			<a href="/stores" class="text-gray-400 hover:text-white transition">← Stores</a>
			<span class="text-gray-600">/</span>
			<h1 class="text-xl font-bold text-white">{data.store.name} Settings</h1>
		</div>

		<form method="POST" use:enhance class="bg-gray-900 rounded-xl p-6 space-y-4">
			{#if form?.error}
				<div class="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">{form.error}</div>
			{/if}
			<div>
				<label class="block text-sm text-gray-400 mb-1" for="name">Store Name</label>
				<input id="name" name="name" type="text" required value={data.store.name}
					class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
			</div>
			<div>
				<p class="block text-sm text-gray-400 mb-1">Shopify Domain</p>
				<div class="text-gray-400 text-sm bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">{data.store.domain}</div>
			</div>
			<div>
				<label class="block text-sm text-gray-400 mb-1" for="apiToken">Admin API Token <span class="text-gray-600">(leave blank to keep current)</span></label>
				<input id="apiToken" name="apiToken" type="password" placeholder="shpat_..."
					class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="airLeadDays">Air Lead Days</label>
					<input id="airLeadDays" name="airLeadDays" type="number" value={data.store.airLeadDays} min="1" max="365"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
				<div>
					<label class="block text-sm text-gray-400 mb-1" for="seaLeadDays">Sea Lead Days</label>
					<input id="seaLeadDays" name="seaLeadDays" type="number" value={data.store.seaLeadDays} min="1" max="365"
						class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none" />
				</div>
			</div>
			<button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition">
				Save Changes
			</button>
		</form>
	</div>
</div>
