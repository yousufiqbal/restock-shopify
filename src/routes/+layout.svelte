<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if data?.user}
<nav class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
	<a href="/" class="font-bold text-lg tracking-tight">RestockHQ</a>
	<div class="flex items-center gap-4">
		<a href="/stores" class="text-gray-300 hover:text-white text-sm">Stores</a>
		<form method="POST" action="/auth/logout">
			<button class="text-gray-400 hover:text-white text-sm">Logout</button>
		</form>
	</div>
</nav>
{/if}

{@render children()}
