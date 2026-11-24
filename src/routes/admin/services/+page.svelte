<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import { flip } from 'svelte/animate';

	let { data } = $props();
	let items = $state<typeof data.services>([]);
	$effect(() => {
		items = [...data.services];
	});
	let reorderForm: HTMLFormElement | undefined = $state();

	function move(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= items.length) return;
		const next = [...items];
		[next[i], next[j]] = [next[j], next[i]];
		items = next;
		queueMicrotask(() => reorderForm?.requestSubmit());
	}
</script>

<PageHeader title="Diensten" description="De volgorde hier is de volgorde op de website. De eerste twee krijgen een grote fototegel.">
	{#snippet actions()}
		<a href="/admin/services/new" class="btn-primary btn-sm"><Icon name="plus" class="h-4 w-4" />Nieuwe dienst</a>
	{/snippet}
</PageHeader>

<form method="POST" action="?/reorder" bind:this={reorderForm} use:enhance={() => async ({ update }) => update({ reset: false })} hidden>
	{#each items as s (s.id)}<input type="hidden" name="order" value={s.id} />{/each}
</form>

<ul class="space-y-2">
	{#each items as s, i (s.id)}
		<li animate:flip={{ duration: 200 }} class="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-ink-100 sm:gap-4 {s.isActive ? '' : 'opacity-60'}">
			<div class="flex flex-col">
				<button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded text-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30" disabled={i === 0} onclick={() => move(i, -1)} aria-label="Omhoog"><Icon name="chevron-up" class="h-4 w-4" /></button>
				<button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded text-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30" disabled={i === items.length - 1} onclick={() => move(i, 1)} aria-label="Omlaag"><Icon name="chevron-down" class="h-4 w-4" /></button>
			</div>
			<span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink-50 text-brand-600">
				<Icon name={s.iconName} class="h-5 w-5" />
			</span>
			<a href="/admin/services/{s.id}" class="min-w-0 flex-1">
				<span class="flex items-center gap-2 font-semibold text-ink-900 hover:text-brand-600">
					{s.title}
					{#if i < 2}<span class="rounded-sm bg-ink-100 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-ink-600 uppercase">Grote tegel</span>{/if}
				</span>
				<span class="line-clamp-1 text-sm text-ink-500">{s.shortDescription}</span>
			</a>
			<form method="POST" action="?/toggle" use:enhance>
				<input type="hidden" name="id" value={s.id} />
				<button
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset {s.isActive
						? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
						: 'text-ink-500 ring-ink-200'}"
					title={s.isActive ? 'Verbergen op de website' : 'Tonen op de website'}
				>
					<Icon name={s.isActive ? 'eye' : 'eye-off'} class="h-3.5 w-3.5" />
					<span class="hidden sm:inline">{s.isActive ? 'Zichtbaar' : 'Verborgen'}</span>
				</button>
			</form>
			<a href="/admin/services/{s.id}" class="btn-outline btn-sm"><Icon name="pencil" class="h-4 w-4" /><span class="hidden sm:inline">Bewerken</span></a>
		</li>
	{/each}
</ul>
