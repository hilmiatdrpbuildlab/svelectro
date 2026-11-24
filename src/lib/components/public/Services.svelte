<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { t } from '$lib/i18n';
	import { requestQuoteFor } from '$lib/state/quote.svelte';

	interface ServiceItem {
		id: string;
		title: string;
		slug: string;
		shortDescription: string;
		fullDescription: string;
		iconName: string;
		coverImageUrl: string | null;
	}

	let { services }: { services: ServiceItem[] } = $props();
	let active = $state<ServiceItem | null>(null);
	let open = $state(false);

	function show(s: ServiceItem) {
		active = s;
		open = true;
	}

	// Bento rhythm: the first two services get photo tiles, the rest compact icon tiles.
	const layout = (i: number) =>
		i === 0 ? 'sm:col-span-2 lg:row-span-2' : i === 1 ? 'sm:col-span-2' : '';
</script>

<section id="diensten" class="bg-ink-50 py-20 sm:py-28" aria-labelledby="diensten-titel">
	<div class="container-x">
		<div class="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
			<h2 id="diensten-titel" class="display text-[clamp(2.4rem,5.5vw,4rem)] text-balance text-ink-950">
				{t('services.title')}
			</h2>
			<p class="max-w-xl text-lg leading-relaxed text-ink-600 lg:justify-self-end">{t('services.intro')}</p>
		</div>

		<ul class="mt-14 grid gap-4 sm:auto-rows-[minmax(15rem,auto)] sm:grid-cols-2 lg:grid-cols-4">
			{#each services as s, i (s.id)}
				<li id="dienst-{s.slug}" class="scroll-mt-28 {layout(i)}">
					<button
						type="button"
						onclick={() => show(s)}
						aria-labelledby="dienst-{s.slug}-titel"
						aria-describedby="dienst-{s.slug}-tekst"
						class="group relative flex h-full w-full flex-col overflow-hidden rounded-lg text-left ring-1 {i < 2 ? 'min-h-72' : ''} transition duration-300 ease-(--ease-snap) hover:-translate-y-1 hover:shadow-xl {i <
						2
							? 'bg-ink-900 text-white ring-ink-900'
							: 'bg-white text-ink-900 ring-ink-100 hover:ring-ink-200'}"
					>
						{#if i < 2 && s.coverImageUrl}
							<img
								src={s.coverImageUrl}
								alt=""
								loading="lazy"
								decoding="async"
								class="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 ease-(--ease-snap) group-hover:scale-[1.04] group-hover:opacity-60"
							/>
							<span class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/0"></span>
						{/if}
						<span class="relative flex h-full flex-col p-6 sm:p-7 {i < 2 ? 'justify-end' : ''}">
							<span
								class="inline-flex h-12 w-12 items-center justify-center rounded-md transition {i < 2
									? 'bg-brand-600 text-white'
									: 'bg-ink-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'}"
							>
								<Icon name={s.iconName} class="h-6 w-6" />
							</span>
							<span
								id="dienst-{s.slug}-titel"
								class="font-condensed mt-5 block font-extrabold uppercase {i === 0
									? 'text-3xl sm:text-4xl'
									: 'text-2xl'} leading-none"
							>
								{s.title}
							</span>
							<span id="dienst-{s.slug}-tekst" class="mt-3 block leading-relaxed {i < 2 ? 'max-w-md text-ink-100' : 'text-ink-600'}">
								{s.shortDescription}
							</span>
							<span
								aria-hidden="true"
								class="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold {i < 2
									? 'text-white'
									: 'text-brand-600'}"
							>
								{t('services.more')}
								<Icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
							</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</section>

<Modal bind:open label={active?.title ?? ''}>
	{#if active}
		{#if active.coverImageUrl}
			<img src={active.coverImageUrl} alt="" class="aspect-[16/8] w-full object-cover" />
		{/if}
		<div class="p-6 sm:p-10">
			<div class="flex items-center gap-4">
				<span class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-600">
					<Icon name={active.iconName} class="h-6 w-6" />
				</span>
				<h3 class="display text-3xl text-ink-950 sm:text-4xl">{active.title}</h3>
			</div>
			<div class="mt-6 space-y-4 text-lg leading-relaxed text-ink-700">
				<RichText text={active.fullDescription || active.shortDescription} />
			</div>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<button
					type="button"
					class="btn-primary"
					onclick={() => {
						const title = active!.title;
						open = false;
						requestQuoteFor(title);
					}}
				>
					{t('services.quote')}
					<Icon name="arrow-right" class="h-4 w-4" />
				</button>
				<button type="button" class="btn-outline" onclick={() => (open = false)}>{t('services.back')}</button>
			</div>
		</div>
	{/if}
</Modal>
