<script lang="ts">
	import './layout.css';

	let { children, data } = $props();
</script>

{#if data?.user}
<header class="border-b border-gray-200 bg-white sticky top-0 z-50">
	<div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
		<a href="/stores" class="text-sm font-semibold text-gray-900 tracking-tight flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-6 h-6 bg-black rounded text-white text-xs font-bold">R</span>
			RestockHQ
		</a>
		<nav class="flex items-center gap-1">
			<a href="/stores" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
				Stores
			</a>
			<form method="POST" action="/auth/logout">
				<button class="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
					Logout
				</button>
			</form>
		</nav>
	</div>
</header>
{/if}

{@render children()}
