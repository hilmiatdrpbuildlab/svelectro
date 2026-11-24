<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { AboutSettings, CompanySettings } from '$lib/content';
	import { t } from '$lib/i18n';

	let { about, company }: { about: AboutSettings; company: CompanySettings } = $props();
	const paragraphs = $derived(about.body.split(/\n{2,}/).filter(Boolean));
</script>

<section id="over-ons" class="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-28" aria-labelledby="over-titel">
	<div class="bg-blueprint absolute inset-0 opacity-60" aria-hidden="true"></div>
	<div class="container-x relative grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
		<div class="relative order-last mx-3 lg:order-first lg:mx-0">
			<div class="aspect-[4/3] overflow-hidden rounded-lg bg-ink-800">
				{#if about.imageUrl}
					<img src={about.imageUrl} alt={about.imageAlt} loading="lazy" decoding="async" class="h-full w-full object-cover" />
				{/if}
			</div>
			<!-- Corner brackets, like the marks on an electrical drawing -->
			<span class="absolute -top-3 -left-3 h-14 w-14 border-t-4 border-l-4 border-brand-500" aria-hidden="true"></span>
			<span class="absolute -right-3 -bottom-3 h-14 w-14 border-r-4 border-b-4 border-brand-500" aria-hidden="true"></span>
			{#if company.owner}
				<div class="absolute -bottom-6 left-6 rounded-md bg-brand-600 px-6 py-5 shadow-2xl sm:left-10">
					<p class="text-xs font-bold tracking-[0.16em] text-white uppercase">Zaakvoerder</p>
					<p class="font-condensed mt-1 text-2xl font-extrabold uppercase">{company.owner}</p>
				</div>
			{/if}
		</div>

		<div>
			<h2 id="over-titel" class="display text-[clamp(2.4rem,5.5vw,4rem)] text-balance">{about.title}</h2>
			<div class="mt-6 max-w-[62ch] space-y-4 text-lg leading-relaxed text-ink-200">
				{#each paragraphs as p, i (i)}<p>{p}</p>{/each}
			</div>
			{#if about.quote}
				<figure class="mt-8 max-w-[52ch]">
					<blockquote class="text-xl leading-snug font-semibold text-white sm:text-2xl">
						<span class="text-brand-500" aria-hidden="true">“</span>{about.quote}<span class="text-brand-500" aria-hidden="true">”</span>
					</blockquote>
					{#if company.owner}
						<figcaption class="mt-3 text-sm text-ink-300">{company.owner}, zaakvoerder</figcaption>
					{/if}
				</figure>
			{/if}
			{#if about.highlights.length}
				<ul class="mt-8 grid gap-x-6 gap-y-3 border-t border-white/10 pt-8 sm:grid-cols-2">
					{#each about.highlights as h (h)}
						<li class="flex gap-3">
							<Icon name="check" class="mt-0.5 h-5 w-5 shrink-0 text-brand-500" stroke={2.5} />
							<span class="leading-snug text-ink-100">{h}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	{#if about.partners.length}
		<div class="container-x relative mt-20 border-t border-white/10 pt-10">
			<div class="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
				<h3 class="shrink-0 text-sm font-bold text-ink-300">{t('partners.title')}</h3>
				<ul class="flex flex-wrap items-center gap-x-10 gap-y-4">
					{#each about.partners as p (p)}
						<li class="font-condensed text-2xl font-extrabold tracking-wide text-ink-200 uppercase">{p}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</section>
