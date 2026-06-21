<script lang="ts">
	import './layout.css';

	let { children, data } = $props();
	let menuOpen = $state(false);

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:window onclick={() => { if (menuOpen) menuOpen = false; }} />

{#if data?.user}
<header class="border-b border-gray-200 bg-white sticky top-0 z-50">
	<div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
		<a href="/stores" class="text-sm font-semibold text-gray-900 tracking-tight flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-6 h-6 bg-black rounded text-white text-xs font-bold">R</span>
			Shopify Restock
		</a>
		<nav class="flex items-center gap-1">
			<a href="/stores" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
				Stores
			</a>
			<div class="relative">
				<button type="button" aria-label="Account menu" aria-haspopup="true" aria-expanded={menuOpen}
					onclick={(e) => { e.stopPropagation(); menuOpen = !menuOpen; }}
					class="press flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
				</button>
				{#if menuOpen}
				<div class="animate-pop-in absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50" role="menu">
					{#if data.user?.email}
					<div class="px-3 py-2 border-b border-gray-100">
						<p class="text-xs text-gray-400">Signed in as</p>
						<p class="text-sm text-gray-900 font-medium truncate">{data.user.email}</p>
					</div>
					{/if}
					<a href="/account" onclick={closeMenu} role="menuitem"
						class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
						Account
					</a>
					<form method="POST" action="/auth/logout" class="border-t border-gray-100 mt-1 pt-1">
						<button type="submit" role="menuitem" onclick={(e) => e.stopPropagation()}
							class="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
							<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
							Logout
						</button>
					</form>
				</div>
				{/if}
			</div>
		</nav>
	</div>
</header>
{/if}

{@render children()}
