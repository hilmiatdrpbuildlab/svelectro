<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import { INQUIRY_STATUSES } from '$lib/content';
	import { formatDateTime } from '$lib/format';

	let { data } = $props();
	const total = $derived(Object.values(data.counts).reduce((a, b) => a + b, 0));
	const tabs = $derived([{ value: '', label: 'Alle', n: total }, ...INQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label, n: data.counts[s.value] ?? 0 }))]);
	const href = (status: string, p = 1) => {
		const q = new URLSearchParams();
		if (status) q.set('status', status);
		if (p > 1) q.set('p', String(p));
		return `/admin/inquiries${q.size ? `?${q}` : ''}`;
	};
</script>

<PageHeader title="Aanvragen" description="Offerteaanvragen via het formulier op de website." />

<nav class="-mx-4 mb-5 overflow-x-auto px-4" aria-label="Filter op status">
	<ul class="flex w-max gap-1 rounded-lg bg-white p-1 ring-1 ring-ink-100">
		{#each tabs as t (t.value)}
			<li>
				<a
					href={href(t.value)}
					aria-current={(data.status ?? '') === t.value ? 'page' : undefined}
					class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition {(data.status ?? '') === t.value
						? 'bg-ink-950 text-white'
						: 'text-ink-600 hover:bg-ink-50'}"
				>
					{t.label}<span class="tabular-nums opacity-60">{t.n}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

{#if data.inquiries.length}
	<ul class="divide-y divide-ink-100 overflow-hidden rounded-lg bg-white ring-1 ring-ink-100">
		{#each data.inquiries as r (r.id)}
			<li>
				<a href="/admin/inquiries/{r.id}" class="block px-5 py-4 transition hover:bg-ink-50 {r.status === 'new' ? 'border-l-4 border-brand-600' : 'border-l-4 border-transparent'}">
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
						<span class="font-semibold text-ink-900">{r.fullName}</span>
						{#if r.hasAttachment}<Icon name="paperclip" class="h-3.5 w-3.5 text-ink-400" label="Met bijlage" />{/if}
						<span class="text-sm text-ink-500">{[r.serviceType, r.city].filter(Boolean).join(' · ')}</span>
						<span class="flex-1"></span>
						<span class="text-sm text-ink-500 tabular-nums">{formatDateTime(r.createdAt)}</span>
						<StatusBadge status={r.status} />
					</div>
					<p class="mt-1 line-clamp-1 text-sm text-ink-600">{r.excerpt}</p>
				</a>
			</li>
		{/each}
	</ul>
	{#if data.pages > 1}
		<div class="mt-4 flex items-center justify-between text-sm">
			{#if data.page > 1}<a class="btn-outline btn-sm" href={href(data.status ?? '', data.page - 1)}>Vorige</a>{:else}<span></span>{/if}
			<span class="text-ink-500">Pagina {data.page} van {data.pages}</span>
			{#if data.page < data.pages}<a class="btn-outline btn-sm" href={href(data.status ?? '', data.page + 1)}>Volgende</a>{:else}<span></span>{/if}
		</div>
	{/if}
{:else}
	<div class="rounded-lg bg-white px-6 py-16 text-center ring-1 ring-ink-100">
		<Icon name="inbox" class="mx-auto h-8 w-8 text-ink-300" />
		<p class="mt-3 font-semibold text-ink-800">Geen aanvragen{data.status ? ' met deze status' : ''}</p>
	</div>
{/if}
