<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let saving = $state(false);
</script>

<svelte:head><title>Account · Shopify Restock</title></svelte:head>

<div class="max-w-lg mx-auto px-4 py-10">
	<div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
		<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
		<span class="text-gray-300">/</span>
		<span class="text-gray-900 font-medium">Account</span>
	</div>

	<h1 class="text-2xl font-semibold text-gray-900 mb-1">Account</h1>
	<p class="text-sm text-gray-500 mb-8">Manage your profile and password</p>

	<!-- Profile -->
	<div class="animate-fade-in-up bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
		<h2 class="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
		<dl class="space-y-3 text-sm">
			{#if data.user.name}
			<div class="flex justify-between gap-4">
				<dt class="text-gray-500">Name</dt>
				<dd class="text-gray-900 font-medium truncate">{data.user.name}</dd>
			</div>
			{/if}
			<div class="flex justify-between gap-4">
				<dt class="text-gray-500">Email</dt>
				<dd class="text-gray-900 font-medium truncate">{data.user.email}</dd>
			</div>
		</dl>
	</div>

	<!-- Change password -->
	<div class="animate-fade-in-up bg-white border border-gray-200 rounded-xl shadow-sm p-6" style="animation-delay:0.06s">
		<h2 class="text-sm font-semibold text-gray-900 mb-1">Change password</h2>
		<p class="text-xs text-gray-500 mb-4">Changing your password signs out other sessions.</p>

		{#if form?.success}
		<div class="animate-fade-in mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
			Password updated successfully.
		</div>
		{:else if form?.error}
		<div class="animate-fade-in mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
			{form.error}
		</div>
		{/if}

		<form method="POST" action="?/changePassword" use:enhance={() => {
			saving = true;
			return async ({ update }) => { await update(); saving = false; };
		}} class="space-y-4">
			<div>
				<label for="currentPassword" class="block text-xs font-medium text-gray-600 mb-1">Current password</label>
				<input id="currentPassword" name="currentPassword" type="password" required autocomplete="current-password"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition" />
			</div>
			<div>
				<label for="newPassword" class="block text-xs font-medium text-gray-600 mb-1">New password</label>
				<input id="newPassword" name="newPassword" type="password" required minlength="8" autocomplete="new-password"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition" />
			</div>
			<div>
				<label for="confirmPassword" class="block text-xs font-medium text-gray-600 mb-1">Confirm new password</label>
				<input id="confirmPassword" name="confirmPassword" type="password" required minlength="8" autocomplete="new-password"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500 transition" />
			</div>
			<button type="submit" disabled={saving}
				class="press inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
				{#if saving}
					<svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
				{/if}
				Update password
			</button>
		</form>
	</div>
</div>
