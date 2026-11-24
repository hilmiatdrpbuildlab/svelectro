<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import { formatDateTime } from '$lib/format';

	let { data } = $props();
	const cards = $derived([
		{ label: 'Nieuwe aanvragen', value: data.stats.unread, href: '/admin/inquiries?status=new', icon: 'inbox', accent: true },
		{ label: 'Realisaties', value: data.stats.projects, href: '/admin/projects', icon: 'briefcase' },
		{ label: 'Actieve diensten', value: data.stats.services, href: '/admin/services', icon: 'wrench' },
		{ label: 'Gepubliceerde reviews', value: data.stats.testimonials, href: '/admin/testimonials', icon: 'quote' }
	]);
</script>

<PageHeader title="Dashboard" description="Welkom terug, {data.user?.name.split(' ')[0]}.">
	{#snippet actions()}
		<a href="/admin/projects/new" class="btn-primary btn-sm"><Icon name="plus" class="h-4 w-4" />Nieuwe realisatie</a>
	{/snippet}
</PageHeader>

<ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each cards as c (c.label)}
		<li>
			<a
				href={c.href}
				class="group flex h-full flex-col rounded-lg p-5 ring-1 transition hover:-translate-y-0.5 hover:shadow-lg {c.accent && c.value
					? 'bg-ink-950 text-white ring-ink-950'
					: 'bg-white ring-ink-100'}"
			>
				<span class="flex items-center justify-between">
					<span class="text-sm font-semibold {c.accent && c.value ? 'text-ink-300' : 'text-ink-500'}">{c.label}</span>
					<Icon name={c.icon} class="h-5 w-5 {c.accent && c.value ? 'text-brand-500' : 'text-ink-400'}" />
				</span>
				<span class="font-condensed mt-4 text-5xl font-extrabold tabular-nums">{c.value}</span>
			</a>
		</li>
	{/each}
</ul>

<section class="mt-10 rounded-lg bg-white ring-1 ring-ink-100">
	<div class="flex items-center justify-between border-b border-ink-100 px-5 py-4">
		<h2 class="font-condensed text-xl font-extrabold text-ink-950 uppercase">Recente offerteaanvragen</h2>
		<a href="/admin/inquiries" class="text-sm font-bold text-brand-600 hover:underline">Alle aanvragen</a>
	</div>
	{#if data.recent.length}
		<ul class="divide-y divide-ink-100">
			{#each data.recent as r (r.id)}
				<li>
					<a href="/admin/inquiries/{r.id}" class="flex flex-col gap-2 px-5 py-4 transition hover:bg-ink-50 sm:flex-row sm:items-center sm:gap-4">
						<span class="min-w-0 flex-1">
							<span class="flex items-center gap-2 font-semibold text-ink-900">
								{r.fullName}
								{#if r.hasAttachment}<Icon name="paperclip" class="h-3.5 w-3.5 text-ink-400" label="Met bijlage" />{/if}
							</span>
							<span class="text-sm text-ink-500">{[r.serviceType, r.city].filter(Boolean).join(' · ') || '—'}</span>
						</span>
						<span class="text-sm text-ink-500 tabular-nums">{formatDateTime(r.createdAt)}</span>
						<StatusBadge status={r.status} />
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="px-5 py-12 text-center">
			<Icon name="inbox" class="mx-auto h-8 w-8 text-ink-300" />
			<p class="mt-3 font-semibold text-ink-700">Nog geen aanvragen</p>
			<p class="text-sm text-ink-500">Aanvragen via het offerteformulier op de website verschijnen hier.</p>
		</div>
	{/if}
</section>
