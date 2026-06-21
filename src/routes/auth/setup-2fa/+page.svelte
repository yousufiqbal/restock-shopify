<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Set up two-factor · Shopify Restock</title></svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-semibold text-gray-900">Set up two-factor authentication</h1>
			<p class="text-sm text-gray-500 mt-2">Required to access Shopify Restock. Use Google Authenticator or any TOTP app.</p>
		</div>

		{#if form?.step === 'verify'}
		<!-- Step 2: Scan QR + enter code -->
		<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
			<div>
				<p class="text-sm font-medium text-gray-700 mb-3">1. Scan this QR code with Google Authenticator</p>
				<div class="flex justify-center">
					<img src={form.qrCode} alt="TOTP QR Code" class="w-48 h-48 rounded-lg border border-gray-200" />
				</div>
				<details class="mt-3">
					<summary class="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Can't scan? Enter manually</summary>
					<p class="text-xs font-mono text-gray-600 mt-2 break-all bg-gray-50 rounded p-2">{form.totpUri}</p>
				</details>
			</div>

			{#if form.backupCodes?.length}
			<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
				<p class="text-xs font-semibold text-amber-800 mb-2">Save your backup codes — shown once only</p>
				<div class="grid grid-cols-2 gap-1">
					{#each form.backupCodes as code}
					<span class="font-mono text-xs text-amber-900 bg-amber-100 rounded px-2 py-1">{code}</span>
					{/each}
				</div>
			</div>
			{/if}

			<form method="POST" action="?/confirm" use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}}>
				<input type="hidden" name="totpUri" value={form.totpUri} />
				<input type="hidden" name="backupCodes" value={JSON.stringify(form.backupCodes ?? [])} />

				<p class="text-sm font-medium text-gray-700 mb-2">2. Enter the 6-digit code from the app</p>

				{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-3">{form.error}</div>
				{/if}

				<input
					name="code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength="6"
					placeholder="000000"
					required
					class="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition mb-4"
				/>

				<button type="submit" disabled={loading}
					class="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
					{loading ? 'Verifying…' : 'Activate 2FA'}
				</button>
			</form>
		</div>

		{:else}
		<!-- Step 1: Enter password to generate QR -->
		<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
			<form method="POST" action="?/generate" use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}} class="space-y-4">
				{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
				{/if}

				<div>
					<label for="password" class="block text-xs font-medium text-gray-700 mb-1.5">Confirm your password</label>
					<input id="password" name="password" type="password" required autocomplete="current-password"
						class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition" />
				</div>

				<button type="submit" disabled={loading}
					class="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
					{loading ? 'Generating…' : 'Generate QR code'}
				</button>
			</form>
		</div>
		{/if}
	</div>
</div>
