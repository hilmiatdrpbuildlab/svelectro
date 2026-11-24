<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import Switch from '$lib/components/admin/Switch.svelte';

	let { data, form } = $props();
	const t = $derived(data.testimonial);
	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const v = $derived((form as { values?: Record<string, string> } | null)?.values);
	const val = (k: string, fallback: string | number | null | undefined) => String(v?.[k] ?? fallback ?? '');
	let rating = $state(5);
	$effect(() => {
		rating = Number(v?.rating ?? t?.rating ?? 5);
	});
</script>

<PageHeader title={t ? 'Review bewerken' : 'Nieuwe review'} back={{ href: '/admin/testimonials', label: 'Reviews' }} />

<form method="POST" use:enhance class="max-w-2xl space-y-5 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
	<p class="rounded-md bg-ink-50 px-4 py-3 text-sm text-ink-600">
		Publiceer enkel echte reviews van klanten, met hun toestemming (bv. overgenomen uit Google of Facebook).
	</p>
	<div class="grid gap-5 sm:grid-cols-2">
		<div>
			<label for="clientName" class="field-label">Naam klant *</label>
			<input id="clientName" name="clientName" value={val('clientName', t?.clientName)} aria-invalid={errors.clientName ? 'true' : undefined} class="field" />
			{#if errors.clientName}<p class="field-error">{errors.clientName}</p>{/if}
		</div>
		<div>
			<label for="companyOrCity" class="field-label">Bedrijf of gemeente</label>
			<input id="companyOrCity" name="companyOrCity" value={val('companyOrCity', t?.companyOrCity)} class="field" />
		</div>
	</div>
	<fieldset>
		<legend class="field-label">Score</legend>
		<div class="flex gap-1">
			{#each [1, 2, 3, 4, 5] as n (n)}
				<label class="cursor-pointer">
					<input type="radio" name="rating" value={n} bind:group={rating} class="peer sr-only" />
					<span class="inline-flex h-10 w-10 items-center justify-center rounded-md peer-focus-visible:outline-3 peer-focus-visible:outline-brand-500 {n <= rating ? 'text-brand-500' : 'text-ink-200'}">
						<Icon name="star" class="h-7 w-7" filled stroke={0} />
					</span>
					<span class="sr-only">{n} {n === 1 ? 'ster' : 'sterren'}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	<div>
		<label for="quote" class="field-label">Review *</label>
		<textarea id="quote" name="quote" rows="5" aria-invalid={errors.quote ? 'true' : undefined} class="field">{val('quote', t?.quote)}</textarea>
		{#if errors.quote}<p class="field-error">{errors.quote}</p>{/if}
	</div>
	<div>
		<label for="projectId" class="field-label">Gekoppeld project</label>
		<select id="projectId" name="projectId" class="field">
			<option value="">Geen</option>
			{#each data.projectOptions as p (p.id)}<option value={p.id} selected={val('projectId', t?.projectId) === p.id}>{p.title}</option>{/each}
		</select>
	</div>
	<Switch name="isPublished" checked={t?.isPublished ?? false} label="Gepubliceerd" description="Zichtbaar op de homepage." />
	<div class="border-t border-ink-100 pt-5">
		<button class="btn-primary">{t ? 'Opslaan' : 'Review toevoegen'}</button>
	</div>
</form>
