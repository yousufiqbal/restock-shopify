<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: { storeId: string; sessionId: string } }>();

	let dots = $state('');
	let warning = $state('');
	let elapsed = $state(0);

	onMount(() => {
		// Animate dots
		const dotTimer = setInterval(() => {
			dots = dots.length >= 3 ? '' : dots + '.';
		}, 500);

		// Elapsed timer
		const elapsedTimer = setInterval(() => {
			elapsed++;
		}, 1000);

		// Poll status
		const poll = async () => {
			try {
				const res = await fetch(`/stores/${data.storeId}/restock/${data.sessionId}/preparing`);
				if (!res.ok) return;
				const json = await res.json() as { status: string; warning?: string };
				if (json.status === 'ready') {
					if (json.warning) warning = json.warning;
					clearInterval(dotTimer);
					clearInterval(elapsedTimer);
					// Brief pause so user sees the ready state
					setTimeout(() => goto(`/stores/${data.storeId}/restock/${data.sessionId}/0`), 1200);
				}
			} catch {}
		};

		// Poll immediately then every 10s
		poll();
		const pollTimer = setInterval(poll, 10000);

		return () => {
			clearInterval(dotTimer);
			clearInterval(elapsedTimer);
			clearInterval(pollTimer);
		};
	});

	function fmt(s: number) {
		if (s < 60) return `${s}s`;
		return `${Math.floor(s / 60)}m ${s % 60}s`;
	}
</script>

<svelte:head><title>Preparing session · Shopify Restock</title></svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
	<div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 max-w-sm w-full text-center">
		{#if warning}
			<!-- Report failed but session is ready -->
			<div class="text-3xl mb-4">⚠️</div>
			<h1 class="text-base font-semibold text-gray-900 mb-2">Sales data unavailable</h1>
			<p class="text-sm text-gray-500 mb-1">{warning}</p>
			<p class="text-sm text-gray-400 mb-6">You can still run the session — restock quantities start from 0.</p>
			<p class="text-xs text-gray-400">Redirecting{dots}</p>
		{:else}
			<!-- Amazon logo / icon -->
			<div class="w-12 h-12 mx-auto mb-5 rounded-xl bg-[#FF9900]/10 flex items-center justify-center">
				<svg viewBox="0 0 24 24" class="w-7 h-7 fill-[#FF9900]" xmlns="http://www.w3.org/2000/svg">
					<path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.076-1.045-.869-1.233-1.272-1.808-2.099-1.73 1.764-2.955 2.291-5.197 2.291-2.654 0-4.717-1.638-4.717-4.915 0-2.56 1.387-4.303 3.362-5.155 1.712-.754 4.105-.89 5.934-1.097v-.41c0-.753.059-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.262.567-.549.582l-3.078-.333c-.259-.057-.548-.266-.473-.66.708-3.728 4.081-4.853 7.098-4.853 1.543 0 3.558.41 4.774 1.577 1.543 1.44 1.395 3.364 1.395 5.459v4.945c0 1.489.617 2.141 1.196 2.945.204.285.248.628-.01.839l-2.483 2.025v-.001z"/>
					<path d="M20.672 19.544c-2.149 1.637-5.27 2.509-7.953 2.509-3.762 0-7.148-1.391-9.709-3.702-.201-.182-.021-.431.221-.289 2.765 1.608 6.184 2.574 9.716 2.574 2.382 0 5.002-.493 7.411-1.517.363-.155.668.238.314.425z"/>
					<path d="M21.52 18.576c-.275-.352-1.814-.166-2.504-.084-.211.026-.242-.158-.053-.29 1.226-.863 3.238-.614 3.472-.325.234.292-.061 2.306-1.213 3.267-.176.148-.345.069-.266-.126.259-.647.837-2.09.564-2.442z"/>
				</svg>
			</div>

			<h1 class="text-base font-semibold text-gray-900 mb-2">Fetching Amazon sales data</h1>
			<p class="text-sm text-gray-500 mb-1">Requesting 90-day order report from Amazon{dots}</p>
			<p class="text-xs text-gray-400 mb-6">This usually takes 2–5 minutes. Don't close this tab.</p>

			<!-- Spinner -->
			<div class="flex justify-center mb-6">
				<div class="w-8 h-8 border-2 border-gray-200 border-t-[#FF9900] rounded-full animate-spin"></div>
			</div>

			<div class="text-xs text-gray-400">Elapsed: {fmt(elapsed)}</div>
		{/if}
	</div>
</div>
