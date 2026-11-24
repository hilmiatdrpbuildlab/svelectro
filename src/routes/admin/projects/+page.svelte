<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import { PROJECT_CATEGORIES } from '$lib/content';

	let { data } = $props();
	let filter = $state('');
	let order = $state<string[]>([]);
	$effect(() => {
		order = data.projects.map((p) => p.id);
	});
	const byId = $derived(new Map(data.projects.map((p) => [p.id, p])));
	const list = $derived(order.map((id) => byId.get(id)!).filter((p) => p && (!filter || p.category === filter)));

	let reorderForm: HTMLFormElement | undefined = $state();
	function move(id: string, dir: -1 | 1) {
		const i = order.indexOf(id);
		const j = i + dir;
		if (j < 0 || j >= order.length) return;
		const next = [...order];
		[next[i], next[j]] = [next[j], next[i]];
		order = next;
		queueMicrotask(() => reorderForm?.requestSubmit());
	}
</script>

<PageHeader title="Realisaties" description="Projecten in de portfolio op de homepage.">
	{#snippet actions()}
		<a href="/admin/projects/new" class="btn-primary btn-sm"><Icon name="plus" class="h-4 w-4" />Nieuwe realisatie</a>
	{/snippet}
</PageHeader>

<form method="POST" action="?/reorder" bind:this={reorderForm} use:enhance={() => async ({ update }) => update({ reset: false })} hidden>
	{#each order as id (id)}<input type="hidden" name="order" value={id} />{/each}
</form>

<div class="mb-4 flex flex-wrap items-center gap-3">
	<label for="cat" class="text-sm font-semibold text-ink-600">Categorie</label>
	<select id="cat" bind:value={filter} class="field !w-auto !py-2">
		<option value="">Alle categorieën</option>
		{#each PROJECT_CATEGORIES as c (c)}<option>{c}</option>{/each}
	</select>
	<span class="text-sm text-ink-500">{list.length} {list.length === 1 ? 'project' : 'projecten'}</span>
</div>

{#if list.length}
	<ul class="space-y-2">
		{#each list as p (p.id)}
			<li class="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-ink-100 sm:gap-4">
				<div class="flex flex-col">
					<button
						type="button"
						class="inline-flex h-7 w-7 items-center justify-center rounded text-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30"
						disabled={!!filter || order[0] === p.id}
						onclick={() => move(p.id, -1)}
						aria-label="Omhoog"><Icon name="chevron-up" class="h-4 w-4" /></button
					>
					<button
						type="button"
						class="inline-flex h-7 w-7 items-center justify-center rounded text-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30"
						disabled={!!filter || order[order.length - 1] === p.id}
						onclick={() => move(p.id, 1)}
						aria-label="Omlaag"><Icon name="chevron-down" class="h-4 w-4" /></button
					>
				</div>
				<a href="/admin/projects/{p.id}" class="h-16 w-20 shrink-0 overflow-hidden rounded-sm bg-ink-100">
					{#if p.cover}<img src={p.cover} alt="" class="h-full w-full object-cover" loading="lazy" />{/if}
				</a>
				<a href="/admin/projects/{p.id}" class="min-w-0 flex-1">
					<span class="block truncate font-semibold text-ink-900 hover:text-brand-600">{p.title}</span>
					<span class="block truncate text-sm text-ink-500">
						{p.category}{p.location ? ` · ${p.location}` : ''} · {p.imageCount} foto{p.imageCount === 1 ? '' : "'s"}
						{#if p.imageCount === 0}<span class="font-semibold text-brand-700"> · niet zichtbaar zonder foto</span>{/if}
					</span>
				</a>
				<form method="POST" action="?/toggleFeatured" use:enhance>
					<input type="hidden" name="id" value={p.id} />
					<button
						class="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ring-inset sm:inline-flex {p.featured
							? 'bg-brand-50 text-brand-700 ring-brand-200'
							: 'text-ink-500 ring-ink-200 hover:ring-ink-400'}"
						title="Uitgelicht op de homepage (komt eerst)"
					>
						<Icon name="star" class="h-3.5 w-3.5" filled={p.featured} stroke={p.featured ? 0 : 2} />
						{p.featured ? 'Uitgelicht' : 'Uitlichten'}
					</button>
				</form>
				<a href="/admin/projects/{p.id}" class="btn-outline btn-sm"><Icon name="pencil" class="h-4 w-4" /><span class="hidden sm:inline">Bewerken</span></a>
			</li>
		{/each}
	</ul>
	{#if filter}<p class="mt-3 text-sm text-ink-500">Wis de filter om de volgorde aan te passen.</p>{/if}
{:else}
	<div class="rounded-lg bg-white px-6 py-16 text-center ring-1 ring-ink-100">
		<Icon name="briefcase" class="mx-auto h-8 w-8 text-ink-300" />
		<p class="mt-3 font-semibold text-ink-800">Geen realisaties gevonden</p>
		<a href="/admin/projects/new" class="btn-primary btn-sm mt-5">Eerste realisatie toevoegen</a>
	</div>
{/if}
