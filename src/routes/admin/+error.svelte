<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 text-center ring-1 ring-ink-100">
	<Icon name="bolt" class="mx-auto h-10 w-10 text-brand-600" />
	<h1 class="display mt-4 text-3xl text-ink-950">{page.status === 404 ? 'Niet gevonden' : 'Er ging iets mis'}</h1>
	<p class="mt-2 text-ink-600">
		{page.status === 404
			? 'Dit item bestaat niet (meer).'
			: 'De actie kon niet worden uitgevoerd. Uw wijzigingen zijn mogelijk niet opgeslagen; probeer het opnieuw.'}
	</p>
	<div class="mt-6 flex justify-center gap-2">
		<button type="button" class="btn-outline btn-sm" onclick={() => history.back()}>Terug</button>
		<a href="/admin" class="btn-primary btn-sm">Dashboard</a>
	</div>
</div>
