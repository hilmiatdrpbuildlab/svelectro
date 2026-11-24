<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let { form } = $props();
	let pending = $state(false);
	let show = $state(false);
</script>

<svelte:head><title>Aanmelden | SV Electro beheer</title></svelte:head>

<div class="relative grid min-h-dvh place-items-center bg-ink-950 px-4 py-12">
	<div class="bg-blueprint absolute inset-0" aria-hidden="true"></div>
	<div class="relative w-full max-w-sm">
		<div class="mb-8 flex justify-center"><Logo tone="light" /></div>
		<div class="rounded-lg bg-white p-7 shadow-2xl sm:p-8">
			<h1 class="display text-3xl text-ink-950">Beheer</h1>
			<p class="mt-1 text-sm text-ink-500">Meld u aan om de website te beheren.</p>

			<form
				method="POST"
				class="mt-6 space-y-4"
				use:enhance={() => {
					pending = true;
					return async ({ update }) => {
						await update();
						pending = false;
					};
				}}
			>
				<div>
					<label for="email" class="field-label">E-mailadres</label>
					<input id="email" name="email" type="email" autocomplete="username" required value={form?.email ?? ''} class="field" />
				</div>
				<div>
					<label for="password" class="field-label">Wachtwoord</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={show ? 'text' : 'password'}
							autocomplete="current-password"
							required
							class="field pr-11"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-500 hover:text-ink-900"
							onclick={() => (show = !show)}
							aria-label={show ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
						>
							<Icon name={show ? 'eye-off' : 'eye'} class="h-4 w-4" />
						</button>
					</div>
				</div>
				{#if form?.error}
					<p class="rounded-md bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700" role="alert">{form.error}</p>
				{/if}
				<button class="btn-primary w-full" disabled={pending}>{pending ? 'Bezig…' : 'Aanmelden'}</button>
			</form>
		</div>
		<p class="mt-6 text-center text-sm text-ink-400"><a href="/" class="hover:text-white">← Terug naar de website</a></p>
	</div>
</div>
