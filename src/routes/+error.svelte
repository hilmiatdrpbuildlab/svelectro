<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head><title>{notFound ? 'Pagina niet gevonden' : 'Er ging iets mis'} | SV Electro</title></svelte:head>

<div class="relative grid min-h-dvh place-items-center bg-ink-950 px-4 text-white">
	<div class="bg-blueprint absolute inset-0" aria-hidden="true"></div>
	<div class="relative max-w-lg text-center">
		<a href="/" class="inline-block"><Logo tone="light" /></a>
		<p class="display mt-10 text-8xl text-brand-500">{page.status}</p>
		<h1 class="display mt-4 text-4xl">{notFound ? 'Deze pagina bestaat niet' : 'Kortsluiting'}</h1>
		<p class="mt-4 text-lg text-ink-300">
			{notFound
				? 'De link klopt niet (meer). Ga terug naar de startpagina.'
				: 'Er ging iets mis aan onze kant. Probeer het zo meteen opnieuw.'}
		</p>
		<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
			<a href="/" class="btn-primary">Naar de startpagina</a>
			<a href="/#contact" class="btn-ghost-light">Contact</a>
		</div>
	</div>
</div>
