<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import { INQUIRY_STATUSES, telHref } from '$lib/content';
	import { formatDateTime } from '$lib/format';

	let { data } = $props();
	const q = $derived(data.inquiry);
	const mailto = $derived(
		`mailto:${q.email}?subject=${encodeURIComponent(`Uw aanvraag bij SV Electro${q.serviceType ? `: ${q.serviceType}` : ''}`)}&body=${encodeURIComponent(`Beste ${q.fullName.split(' ')[0]},\n\n`)}`
	);
</script>

<PageHeader title={q.fullName} description="Ontvangen op {formatDateTime(q.createdAt)}" back={{ href: '/admin/inquiries', label: 'Aanvragen' }} />

<div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
	<div class="space-y-6">
		<section class="rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
			<h2 class="text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">Projectomschrijving</h2>
			{#if q.serviceType}<p class="mt-3 inline-block rounded-sm bg-ink-50 px-2 py-1 text-sm font-bold text-ink-700">{q.serviceType}</p>{/if}
			<p class="mt-3 leading-relaxed whitespace-pre-line text-ink-800">{q.message}</p>
		</section>

		{#if q.attachment}
			<section class="rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
				<div class="flex items-center justify-between gap-3">
					<h2 class="text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">Bijlage</h2>
					<div class="flex gap-2">
						<a href={q.attachment.href} target="_blank" class="btn-outline btn-sm"><Icon name="external" class="h-4 w-4" />Openen</a>
						<a href="{q.attachment.href}&download" class="btn-outline btn-sm"><Icon name="upload" class="h-4 w-4 rotate-180" />Downloaden</a>
					</div>
				</div>
				{#if q.attachment.isImage}
					<a href={q.attachment.href} target="_blank" class="mt-4 block overflow-hidden rounded-md bg-ink-50">
						<img src={q.attachment.href} alt="Bijlage van {q.fullName}" class="max-h-[32rem] w-full object-contain" />
					</a>
				{:else}
					<p class="mt-4 flex items-center gap-2 text-sm text-ink-700"><Icon name="file" class="h-4 w-4" />{q.attachment.name}</p>
				{/if}
			</section>
		{/if}
	</div>

	<aside class="space-y-6">
		<section class="rounded-lg bg-white p-5 ring-1 ring-ink-100">
			<h2 class="text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">Status</h2>
			<form method="POST" action="?/status" use:enhance={() => async ({ update }) => update({ reset: false })} class="mt-3 grid gap-2">
				{#each INQUIRY_STATUSES as s (s.value)}
					<button
						name="status"
						value={s.value}
						aria-pressed={q.status === s.value}
						class="flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-semibold ring-1 transition ring-inset {q.status === s.value
							? 'bg-ink-950 text-white ring-ink-950'
							: 'text-ink-700 ring-ink-200 hover:ring-ink-400'}"
					>
						{s.label}
						{#if q.status === s.value}<Icon name="check" class="h-4 w-4 text-brand-500" />{/if}
					</button>
				{/each}
			</form>
		</section>

		<section class="rounded-lg bg-white p-5 ring-1 ring-ink-100">
			<h2 class="text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">Contact</h2>
			<dl class="mt-3 space-y-3 text-sm">
				{#if q.email}<div><dt class="text-ink-500">E-mail</dt><dd><a href="mailto:{q.email}" class="font-semibold break-all text-ink-900 hover:text-brand-600">{q.email}</a></dd></div>{/if}
				{#if q.phone}<div><dt class="text-ink-500">Telefoon</dt><dd><a href={telHref(q.phone)} class="font-semibold text-ink-900 hover:text-brand-600">{q.phone}</a></dd></div>{/if}
				{#if q.city}<div><dt class="text-ink-500">Gemeente</dt><dd class="font-semibold text-ink-900">{q.city}</dd></div>{/if}
			</dl>
			{#if !q.email}<p class="mt-3 text-sm text-ink-500">Geen e-mailadres opgegeven: bel de klant terug.</p>{/if}
			<div class="mt-5 grid gap-2">
				{#if q.phone}<a href={telHref(q.phone)} class="{q.email ? 'btn-outline' : 'btn-primary'} btn-sm"><Icon name="phone" class="h-4 w-4" />Bellen</a>{/if}
				{#if q.email}<a href={mailto} class="{q.phone ? 'btn-outline' : 'btn-primary'} btn-sm"><Icon name="mail" class="h-4 w-4" />Beantwoorden per e-mail</a>{/if}
			</div>
		</section>

		<form
			method="POST"
			action="?/delete"
			use:enhance={({ cancel }) => {
				if (!confirm('Deze aanvraag en de bijlage definitief verwijderen?')) cancel();
			}}
		>
			<button class="btn btn-sm w-full text-brand-700 hover:bg-brand-50"><Icon name="trash" class="h-4 w-4" />Aanvraag verwijderen</button>
		</form>
	</aside>
</div>
