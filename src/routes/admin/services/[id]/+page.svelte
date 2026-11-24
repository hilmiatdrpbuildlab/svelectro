<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { optimiseFormImages } from '$lib/client/image';
	import Icon from '$lib/components/Icon.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import Switch from '$lib/components/admin/Switch.svelte';
	import { ICON_NAMES } from '$lib/content';

	let { data, form } = $props();
	const s = $derived(data.service);
	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const v = $derived((form as { values?: Record<string, string> } | null)?.values);
	const val = (k: string, fallback: string | null | undefined) => v?.[k] ?? fallback ?? '';
	let icon = $state('bolt');
	$effect(() => {
		icon = v?.iconName ?? s?.iconName ?? 'bolt';
	});
	let saving = $state(false);
</script>

<PageHeader title={s ? s.title : 'Nieuwe dienst'} back={{ href: '/admin/services', label: 'Diensten' }} />

{#if page.url.searchParams.has('created')}
	<p class="mb-6 flex items-center gap-2 rounded-md bg-ink-950 px-4 py-3 text-sm font-semibold text-white">
		<Icon name="check" class="h-4 w-4 text-brand-500" /> Dienst aangemaakt.
	</p>
{/if}

<form
	method="POST"
	action="?/save"
	enctype="multipart/form-data"
	class="max-w-3xl space-y-5 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6"
	use:enhance={async ({ formData }) => {
		saving = true;
		await optimiseFormImages(formData, 'cover', { max: 1800, thumb: false });
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div class="grid gap-5 sm:grid-cols-[1fr_14rem]">
		<div>
			<label for="title" class="field-label">Titel *</label>
			<input id="title" name="title" required value={val('title', s?.title)} aria-invalid={errors.title ? 'true' : undefined} class="field" />
			{#if errors.title}<p class="field-error">{errors.title}</p>{/if}
		</div>
		<div>
			<label for="slug" class="field-label">Slug</label>
			<input id="slug" name="slug" value={val('slug', s?.slug)} placeholder="automatisch" class="field" />
		</div>
	</div>
	<div>
		<label for="shortDescription" class="field-label">Korte omschrijving * <span class="font-normal text-ink-500">(op de tegel)</span></label>
		<textarea id="shortDescription" name="shortDescription" rows="2" maxlength="300" aria-invalid={errors.shortDescription ? 'true' : undefined} class="field">{val('shortDescription', s?.shortDescription)}</textarea>
		{#if errors.shortDescription}<p class="field-error">{errors.shortDescription}</p>{/if}
	</div>
	<div>
		<label for="fullDescription" class="field-label">Volledige beschrijving <span class="font-normal text-ink-500">(in het detailvenster)</span></label>
		<textarea id="fullDescription" name="fullDescription" rows="8" class="field">{val('fullDescription', s?.fullDescription)}</textarea>
		<p class="mt-1 text-xs text-ink-500">Lege regel = nieuwe alinea. Regels die beginnen met “- ” worden een opsomming.</p>
	</div>

	<fieldset>
		<legend class="field-label">Icoon</legend>
		<div class="grid grid-cols-6 gap-2 sm:grid-cols-12">
			{#each ICON_NAMES as name (name)}
				<label class="cursor-pointer" title={name}>
					<input type="radio" name="iconName" value={name} bind:group={icon} class="peer sr-only" />
					<span class="flex aspect-square items-center justify-center rounded-md text-ink-600 ring-1 ring-ink-200 transition peer-checked:bg-brand-600 peer-checked:text-white peer-checked:ring-brand-600 peer-focus-visible:outline-3 peer-focus-visible:outline-brand-500 hover:ring-ink-400">
						<Icon {name} class="h-5 w-5" />
					</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<ImageField name="cover" label="Omslagfoto" current={s?.coverImageUrl} removable />
	{#if errors.cover}<p class="field-error">{errors.cover}</p>{/if}

	<Switch name="isActive" checked={s?.isActive ?? true} label="Zichtbaar op de website" />

	<div class="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
		<button class="btn-primary" disabled={saving}>{saving ? 'Opslaan…' : s ? 'Wijzigingen opslaan' : 'Dienst aanmaken'}</button>
		{#if s}
			<button
				formaction="?/delete"
				formnovalidate
				class="btn btn-sm text-brand-700 hover:bg-brand-50"
				onclick={(e) => {
					if (!confirm(`Dienst “${s.title}” definitief verwijderen?`)) e.preventDefault();
				}}
			>
				<Icon name="trash" class="h-4 w-4" />Verwijderen
			</button>
		{/if}
	</div>
</form>
