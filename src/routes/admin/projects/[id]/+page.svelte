<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ProjectPhotos from '$lib/components/admin/ProjectPhotos.svelte';
	import Switch from '$lib/components/admin/Switch.svelte';
	import { CLIENT_TYPES, PROJECT_CATEGORIES } from '$lib/content';

	let { data, form } = $props();
	const p = $derived(data.project);
	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const v = $derived((form as { values?: Record<string, string> } | null)?.values);
	const val = (k: string, fallback: string | null | undefined) => v?.[k] ?? fallback ?? '';
	let saving = $state(false);
</script>

<PageHeader
	title={p ? p.title : 'Nieuwe realisatie'}
	description={p ? `/${p.slug}` : 'Vul de gegevens in. Daarna kunt u foto’s toevoegen.'}
	back={{ href: '/admin/projects', label: 'Realisaties' }}
>
	{#snippet actions()}
		{#if p}<a href="/#realisaties" target="_blank" class="btn-outline btn-sm"><Icon name="external" class="h-4 w-4" />Bekijken</a>{/if}
	{/snippet}
</PageHeader>

{#if page.url.searchParams.has('created')}
	<p class="mb-6 flex items-center gap-2 rounded-md bg-ink-950 px-4 py-3 text-sm font-semibold text-white">
		<Icon name="check" class="h-4 w-4 text-brand-500" /> Project aangemaakt. Voeg nu foto's toe: zonder foto verschijnt het niet op de website.
	</p>
{/if}

<div class="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
	<form
		method="POST"
		action="?/save"
		class="space-y-5 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}
	>
		<div>
			<label for="title" class="field-label">Titel *</label>
			<input id="title" name="title" required value={val('title', p?.title)} aria-invalid={errors.title ? 'true' : undefined} class="field" />
			{#if errors.title}<p class="field-error">{errors.title}</p>{/if}
		</div>
		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="category" class="field-label">Categorie *</label>
				<select id="category" name="category" class="field" aria-invalid={errors.category ? 'true' : undefined}>
					{#each PROJECT_CATEGORIES as c (c)}<option selected={val('category', p?.category) === c}>{c}</option>{/each}
				</select>
				{#if errors.category}<p class="field-error">{errors.category}</p>{/if}
			</div>
			<div>
				<label for="location" class="field-label">Locatie</label>
				<input id="location" name="location" value={val('location', p?.location)} placeholder="Bv. Heist-op-den-Berg" class="field" />
			</div>
			<div>
				<label for="clientType" class="field-label">Type klant</label>
				<select id="clientType" name="clientType" class="field">
					<option value="">—</option>
					{#each CLIENT_TYPES as c (c)}<option selected={val('clientType', p?.clientType) === c}>{c}</option>{/each}
				</select>
			</div>
			<div>
				<label for="completionDate" class="field-label">Opgeleverd op</label>
				<input id="completionDate" name="completionDate" type="date" value={val('completionDate', p?.completionDate)} class="field" />
				{#if errors.completionDate}<p class="field-error">{errors.completionDate}</p>{/if}
			</div>
		</div>
		<div>
			<label for="summary" class="field-label">Korte samenvatting</label>
			<input id="summary" name="summary" maxlength="400" value={val('summary', p?.summary)} placeholder="Eén zin over het project" class="field" />
		</div>
		<div>
			<label for="description" class="field-label">Beschrijving en uitgevoerde werken</label>
			<textarea id="description" name="description" rows="8" class="field font-mono text-sm">{val('description', p?.description)}</textarea>
			<p class="mt-1 text-xs text-ink-500">Lege regel = nieuwe alinea. Regels die beginnen met “- ” worden een opsomming.</p>
		</div>
		<div>
			<label for="slug" class="field-label">URL-naam (slug)</label>
			<input id="slug" name="slug" value={val('slug', p?.slug)} placeholder="Automatisch op basis van de titel" class="field" />
		</div>
		<Switch name="featured" checked={p?.featured ?? false} label="Uitgelicht op de homepage" description="Uitgelichte projecten staan vooraan in de portfolio." />

		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
			<button class="btn-primary" disabled={saving}>{saving ? 'Opslaan…' : p ? 'Wijzigingen opslaan' : 'Project aanmaken'}</button>
			{#if p}
				<button
					formaction="?/delete"
					formnovalidate
					class="btn btn-sm text-brand-700 hover:bg-brand-50"
					onclick={(e) => {
						if (!confirm(`“${p.title}” en alle foto's definitief verwijderen?`)) e.preventDefault();
					}}
				>
					<Icon name="trash" class="h-4 w-4" />Project verwijderen
				</button>
			{/if}
		</div>
	</form>

	{#if p}
		<ProjectPhotos images={data.images} />
	{:else}
		<div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 p-10 text-center text-ink-500">
			<Icon name="image" class="h-8 w-8 text-ink-300" />
			<p class="mt-3 font-semibold text-ink-700">Foto's toevoegen</p>
			<p class="text-sm">Maak eerst het project aan, daarna kunt u hier foto's uploaden.</p>
		</div>
	{/if}
</div>
