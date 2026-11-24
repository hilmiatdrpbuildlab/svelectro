<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';

	let { data } = $props();
	const published = $derived(data.testimonials.filter((t) => t.isPublished).length);
</script>

<PageHeader
	title="Reviews"
	description="{published} gepubliceerd. Het reviewblok op de homepage verschijnt zodra er minstens één review gepubliceerd is."
>
	{#snippet actions()}
		<a href="/admin/testimonials/new" class="btn-primary btn-sm"><Icon name="plus" class="h-4 w-4" />Nieuwe review</a>
	{/snippet}
</PageHeader>

{#if data.testimonials.length}
	<ul class="grid gap-4 md:grid-cols-2">
		{#each data.testimonials as t (t.id)}
			<li class="flex flex-col rounded-lg bg-white p-5 ring-1 ring-ink-100">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="font-semibold text-ink-900">{t.clientName}</p>
						<p class="text-sm text-ink-500">{[t.companyOrCity, t.projectTitle].filter(Boolean).join(' · ') || '—'}</p>
					</div>
					<span
						class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset {t.isPublished
							? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
							: 'bg-ink-50 text-ink-600 ring-ink-200'}">{t.isPublished ? 'Gepubliceerd' : 'Concept'}</span
					>
				</div>
				<div class="mt-3 flex gap-0.5 text-brand-500" aria-label="{t.rating} op 5">
					{#each Array(5) as _, i (i)}<Icon name="star" class="h-4 w-4 {i < t.rating ? '' : 'text-ink-200'}" filled stroke={0} />{/each}
				</div>
				<p class="mt-3 line-clamp-4 flex-1 text-ink-700">“{t.quote}”</p>
				<div class="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
					<form method="POST" action="?/toggle" use:enhance>
						<input type="hidden" name="id" value={t.id} />
						<button class="btn-outline btn-sm"><Icon name={t.isPublished ? 'eye-off' : 'eye'} class="h-4 w-4" />{t.isPublished ? 'Verbergen' : 'Publiceren'}</button>
					</form>
					<a href="/admin/testimonials/{t.id}" class="btn-outline btn-sm"><Icon name="pencil" class="h-4 w-4" />Bewerken</a>
					<form
						method="POST"
						action="?/delete"
						use:enhance={({ cancel }) => {
							if (!confirm('Deze review verwijderen?')) cancel();
						}}
						class="ml-auto"
					>
						<input type="hidden" name="id" value={t.id} />
						<button class="btn btn-sm text-brand-700 hover:bg-brand-50" aria-label="Verwijderen"><Icon name="trash" class="h-4 w-4" /></button>
					</form>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<div class="rounded-lg bg-white px-6 py-16 text-center ring-1 ring-ink-100">
		<Icon name="quote" class="mx-auto h-8 w-8 text-ink-300" />
		<p class="mt-3 font-semibold text-ink-800">Nog geen reviews</p>
	</div>
{/if}
