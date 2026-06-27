<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	let { data, form } = $props();
	let deleteOpen = $state(false);
	let deleteFormEl = $state<HTMLFormElement>();

	const REQUIRED_SCOPES = 'read_products,read_orders,read_locations,read_inventory,write_inventory';

	let clientId = $state(data.store.oauthClientId ?? '');
	let redirectUri = $state(data.store.oauthRedirectUri ?? '');
	let codeInput = $state('');
	let savingSettings = $state(false);
	let tokenLoading = $state(false);
	let toast = $state<{ ok: boolean; msg: string } | null>(null);
	let toastTimer: ReturnType<typeof setTimeout>;
	function showToast(ok: boolean, msg: string) {
		toast = { ok, msg };
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = null), 3500);
	}

	const authorizeUrl = $derived.by(() => {
		if (!clientId.trim()) return '';
		const p = new URLSearchParams({
			client_id: clientId.trim(),
			scope: REQUIRED_SCOPES,
			redirect_uri: redirectUri.trim() || `https://${data.store.domain}`,
		});
		return `https://${data.store.domain}/admin/oauth/authorize?${p.toString()}`;
	});

</script>

<svelte:head><title>{data.store.name} settings · Shopify Restock</title></svelte:head>

<ConfirmModal
	bind:open={deleteOpen}
	title="Delete {data.store.name}?"
	message="All sessions and data will be permanently deleted. This cannot be undone."
	confirmLabel="Delete store"
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>

<div class="max-w-xl mx-auto px-4 py-10 space-y-6">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<a href="/stores/{data.store.id}" class="hover:text-gray-900 transition-colors">{data.store.name}</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900">Settings</span>
	</div>

	<h1 class="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

	<!-- Main settings -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
		<h2 class="text-sm font-semibold text-gray-900 mb-5">Store details</h2>

		<form method="POST" action="?/save" use:enhance={() => {
			savingSettings = true;
			return async ({ result, update }) => {
				await update({ reset: false });
				savingSettings = false;
				if (result.type === 'success') showToast(true, 'Settings saved.');
				else if (result.type === 'failure') {
					const err = (result.data as { error?: string })?.error ?? 'Failed to save';
					showToast(false, err);
				}
			};
		}} class="space-y-4">

			<div>
				<label class="block text-xs font-medium text-gray-700 mb-1.5" for="name">Store name</label>
				<input id="name" name="name" type="text" required value={data.store.name}
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
			</div>
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

			<div class="border-t border-gray-100 pt-4">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">OAuth app credentials</p>
				<div class="space-y-3">
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-1.5" for="oauthClientId">Client ID</label>
						<input id="oauthClientId" name="oauthClientId" type="text"
							bind:value={clientId}
							placeholder="abc123..."
							class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
					</div>
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-1.5" for="oauthClientSecret">Client Secret</label>
						<input id="oauthClientSecret" name="oauthClientSecret" type="password"
							value={data.store.oauthClientSecret ?? ''}
							placeholder="••••••••"
							class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
					</div>
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-1.5" for="oauthRedirectUri">Redirect URI</label>
						<input id="oauthRedirectUri" name="oauthRedirectUri" type="text"
							bind:value={redirectUri}
							class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
						<p class="text-xs text-gray-400 mt-1">Add this to your Shopify Partner app's allowed redirect URLs.</p>
					</div>
				</div>
			</div>

			<div class="pt-2 flex gap-2">
				<button type="submit" disabled={savingSettings} class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
					{#if savingSettings}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
					{/if}
					Save changes
				</button>
				<a href="/stores/{data.store.id}" class="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-block">
					Cancel
				</a>
			</div>
		</form>
	</div>

	<!-- OAuth token tool -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
		<h2 class="text-sm font-semibold text-gray-900">Access Token</h2>

		{#if !clientId.trim() || !data.store.oauthClientSecret}
		<p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
			Save Client ID and Client Secret above first.
		</p>
		{/if}

		<!-- Step 1: Get Code -->
		<div class="border border-gray-100 rounded-xl p-4 space-y-3">
			<div class="flex items-center gap-2 mb-1">
				<span class="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
				<p class="text-xs font-semibold text-gray-800">Get code from Shopify</p>
			</div>
			<p class="text-xs text-gray-500">Opens the OAuth page. After you approve, Shopify redirects you — copy the <span class="font-mono bg-gray-100 px-1 rounded">code=</span> value from that URL.</p>

			{#if authorizeUrl}
			<a href={authorizeUrl} target="_blank" rel="noopener noreferrer"
				class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
				<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
				Get Code
			</a>
			{:else}
			<button disabled class="inline-flex items-center gap-2 bg-gray-100 text-gray-400 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed">Get Code</button>
			{/if}
		</div>

		<!-- Step 2: Exchange Code -->
		<div class="border border-gray-100 rounded-xl p-4">
			<div class="flex items-center gap-2 mb-3">
				<span class="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
				<p class="text-xs font-semibold text-gray-800">Paste code → get token</p>
			</div>
			<p class="text-xs text-gray-500 mb-3">From the redirect URL, copy the <span class="font-mono bg-gray-100 px-1 rounded">code</span> param and paste it below.</p>
			<form method="POST" action="?/exchangeToken" use:enhance={() => {
				tokenLoading = true;
				return async ({ result, update }) => {
					await update({ reset: false });
					tokenLoading = false;
					if (result.type === 'success' && (result.data as { tokenSaved?: boolean })?.tokenSaved) {
						codeInput = '';
						showToast(true, 'Access token saved successfully.');
					} else if (result.type === 'failure') {
						const err = (result.data as { tokenError?: string })?.tokenError ?? 'Unknown error';
						showToast(false, err);
					}
				};
			}} class="flex gap-2">
				<input type="text" name="code" bind:value={codeInput} placeholder="15dfb9768a085c9fe34c5a9..."
					class="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				<button type="submit" disabled={!codeInput.trim() || tokenLoading}
					class="press shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
					{#if tokenLoading}
						<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
					{/if}
					Get Token
				</button>
			</form>
		</div>
	</div>

	<!-- Required API permissions -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
		<h2 class="text-sm font-semibold text-gray-900 mb-1">Required API permissions</h2>
		<p class="text-xs text-gray-500 mb-4">
			Token must have these scopes. Shopify Admin → Settings → Apps → Develop apps → your app → Configuration.
		</p>
		<div class="space-y-1">
			{#each [
				{ scope: 'read_products', used: 'Fetch product list and variants' },
				{ scope: 'read_orders', used: 'Calculate 30/60/90 day sales for restock' },
				{ scope: 'read_locations', used: 'Determine which location to update stock at' },
				{ scope: 'read_inventory', used: 'Read current stock levels' },
				{ scope: 'write_inventory', used: 'Apply counted stock back to Shopify' },
			] as p}
			<div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
				<span class="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded shrink-0">{p.scope}</span>
				<span class="text-xs text-gray-500">{p.used}</span>
			</div>
			{/each}
		</div>
	</div>

	<!-- Danger zone -->
	<div class="bg-white border border-red-200 rounded-xl shadow-sm p-6">
		<h2 class="text-sm font-semibold text-red-700 mb-1">Danger zone</h2>
		<p class="text-xs text-gray-500 mb-4">Permanently delete this store and all its sessions and data. This cannot be undone.</p>
		<form method="POST" action="?/delete" use:enhance bind:this={deleteFormEl}>
			<button type="button" onclick={() => (deleteOpen = true)}
				class="press border border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
				Delete store
			</button>
		</form>
	</div>
</div>

{#if toast}
<div class="animate-fade-in-up fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
	{toast.ok ? 'bg-white border-gray-200 text-gray-900' : 'bg-red-50 border-red-200 text-red-800'}">
	{#if toast.ok}
		<svg class="w-4 h-4 text-green-600 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
	{:else}
		<svg class="w-4 h-4 text-red-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
	{/if}
	{toast.msg}
</div>
{/if}
