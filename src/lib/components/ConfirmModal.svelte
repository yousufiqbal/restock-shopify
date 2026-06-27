<script lang="ts">
	let { open = $bindable(false), title = 'Are you sure?', message = '', confirmLabel = 'Delete', onconfirm }: {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		onconfirm: () => void;
	} = $props();

	function confirm() {
		open = false;
		onconfirm();
	}

	function handleKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') open = false;
		if (e.key === 'Enter') confirm();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4"
	onclick={() => (open = false)}>
	<div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6 animate-pop-in"
		role="dialog" aria-modal="true"
		onclick={(e) => e.stopPropagation()}>
		<h2 class="text-base font-semibold text-gray-900 mb-1">{title}</h2>
		{#if message}<p class="text-sm text-gray-500 mb-5">{message}</p>{/if}
		<div class="flex gap-2 justify-end mt-5">
			<button type="button" onclick={() => (open = false)}
				class="press px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-colors">
				Cancel
			</button>
			<button type="button" onclick={confirm}
				class="press px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
				{confirmLabel}
			</button>
		</div>
	</div>
</div>
{/if}
