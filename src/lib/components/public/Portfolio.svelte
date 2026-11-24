<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { t } from '$lib/i18n';
	import { requestQuoteFor } from '$lib/state/quote.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	interface Img {
		id: string;
		imageUrl: string;
		thumbUrl: string | null;
		width: number | null;
		height: number | null;
		caption: string;
	}
	interface ProjectItem {
		id: string;
		title: string;
		slug: string;
		category: string;
		location: string | null;
		clientType: string | null;
		summary: string;
		description: string;
		completionDate: string | null;
		images: Img[];
	}

	let { projects }: { projects: ProjectItem[] } = $props();

	// Only categories with at least two projects get a chip; a filter that returns one tile is noise.
	const counts = $derived(
		projects.reduce((m, p) => m.set(p.category, (m.get(p.category) ?? 0) + 1), new Map<string, number>())
	);
	const categories = $derived([...counts].filter(([, n]) => n >= 2).map(([c]) => c));
	let filter = $state('');
	const visible = $derived(filter ? projects.filter((p) => p.category === filter) : projects);

	let open = $state(false);
	let current = $state<ProjectItem | null>(null);
	let index = $state(0);
	const img = $derived(current?.images[index]);

	function show(p: ProjectItem, i = 0) {
		current = p;
		index = i;
		open = true;
	}
	const step = (d: number) => {
		if (!current) return;
		const n = current.images.length;
		index = (index + d + n) % n;
	};

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowRight') step(1);
		if (e.key === 'ArrowLeft') step(-1);
	}

	let touchX = 0;
	const onTouchStart = (e: TouchEvent) => (touchX = e.touches[0].clientX);
	const onTouchEnd = (e: TouchEvent) => {
		const dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
	};

	const formatDate = (d: string | null) =>
		d ? new Date(d).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' }) : null;

	// Larger tiles for the first project in each row of five: a quiet masonry rhythm.
	const tile = (i: number) => (i % 5 === 0 ? 'col-span-2 row-span-2' : '');
</script>

<svelte:window onkeydown={onKey} />

<section id="realisaties" class="bg-white py-20 sm:py-28" aria-labelledby="realisaties-titel">
	<div class="container-x">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-2xl">
				<h2 id="realisaties-titel" class="display text-[clamp(2.4rem,5.5vw,4rem)] text-balance text-ink-950">
					{t('projects.title')}
				</h2>
				<p class="mt-4 text-lg text-ink-600">{t('projects.intro')}</p>
			</div>
		</div>

		{#if categories.length >= 2}
			<div class="-mx-4 mt-10 overflow-x-auto px-4 [scrollbar-width:none]">
				<div class="flex w-max gap-2" role="group" aria-label={t('projects.filter')}>
					{#each ['', ...categories] as c (c)}
						<button
							type="button"
							aria-pressed={filter === c}
							onclick={() => (filter = c)}
							class="min-h-11 rounded-full px-4 text-sm font-bold whitespace-nowrap ring-1 transition ring-inset {filter === c
								? 'bg-ink-950 text-white ring-ink-950'
								: 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-400'}"
						>
							{c || t('projects.all')}
							<span class="ml-1 font-semibold {filter === c ? 'text-ink-300' : 'text-ink-500'}">
								{c ? counts.get(c) : projects.length}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<ul class="mt-8 grid auto-rows-[11rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[16rem] sm:gap-4 lg:grid-cols-4">
			{#each visible as p, i (p.id)}
				{@const cover = p.images[0]}
				<li class={tile(i)} animate:flip={{ duration: 350 }} in:fade={{ duration: 200 }}>
					<button
						type="button"
						onclick={() => show(p)}
						class="group relative block h-full w-full overflow-hidden rounded-lg bg-ink-800 text-left"
					>
						<img
							src={tile(i) ? cover.imageUrl : (cover.thumbUrl ?? cover.imageUrl)}
							alt={cover.caption || p.title}
							loading="lazy"
							decoding="async"
							width={cover.width ?? undefined}
							height={cover.height ?? undefined}
							class="absolute inset-0 h-full w-full object-cover transition duration-700 ease-(--ease-snap) group-hover:scale-[1.05]"
						/>
						<span class="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/45 to-transparent"></span>
						<span class="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] rounded-sm bg-white px-2 py-1 text-xs leading-tight font-bold tracking-wide text-ink-900 uppercase sm:max-w-[calc(100%-4.5rem)]">
							{p.category}
						</span>
						{#if p.images.length > 1}
							<span class="absolute top-3 right-3 items-center gap-1 rounded-sm bg-ink-950/75 px-2 py-1 text-xs font-bold text-white {tile(i) ? 'inline-flex' : 'hidden sm:inline-flex'}">
								<Icon name="image" class="h-3.5 w-3.5" />{p.images.length}
							</span>
						{/if}
						<span class="absolute inset-x-0 bottom-0 p-3 sm:p-5">
							<span class="font-condensed block leading-tight font-extrabold text-balance text-white uppercase {tile(i) ? 'text-2xl sm:text-3xl' : 'text-base sm:text-xl'}">
								{p.title}
							</span>
							{#if p.location}
								<span class="mt-1 flex items-center gap-1 text-sm text-ink-100">
									<Icon name="map-pin" class="h-3.5 w-3.5 text-brand-400" />{p.location}
								</span>
							{/if}
							<span
								class="mt-3 translate-y-1 items-center gap-1 text-sm font-bold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 sm:inline-flex {tile(i) ? 'inline-flex' : 'hidden'} [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
							>
								{t('projects.view')} <Icon name="arrow-right" class="h-4 w-4" />
							</span>
						</span>
					</button>
				</li>
			{:else}
				<li class="col-span-full py-10 text-center text-ink-500">{t('projects.empty')}</li>
			{/each}
		</ul>
	</div>
</section>

<Modal bind:open label={current?.title ?? ''} size="lg" tone="dark">
	{#if current && img}
		<div class="grid lg:grid-cols-[1fr_22rem]">
			<figure class="relative bg-black" ontouchstart={onTouchStart} ontouchend={onTouchEnd}>
				{#key img.id}
					<img
						src={img.imageUrl}
						alt={img.caption || current.title}
						class="mx-auto max-h-[70dvh] w-full object-contain lg:max-h-[86dvh]"
						in:fade={{ duration: 180 }}
					/>
				{/key}
				{#if current.images.length > 1}
					<button
						type="button"
						onclick={() => step(-1)}
						class="absolute top-1/2 left-3 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 shadow-lg transition hover:bg-white"
					>
						<Icon name="chevron-left" class="h-5 w-5" /><span class="sr-only">{t('lightbox.prev')}</span>
					</button>
					<button
						type="button"
						onclick={() => step(1)}
						class="absolute top-1/2 right-3 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 shadow-lg transition hover:bg-white"
					>
						<Icon name="chevron-right" class="h-5 w-5" /><span class="sr-only">{t('lightbox.next')}</span>
					</button>
				{/if}
				{#if img.caption || current.images.length > 1}
					<figcaption class="flex items-center justify-between gap-4 bg-ink-950 px-5 py-3 text-sm text-ink-300">
						<span>{img.caption}</span>
						{#if current.images.length > 1}
							<span class="tabular-nums" aria-live="polite">{index + 1} / {current.images.length}</span>
						{/if}
					</figcaption>
				{/if}
			</figure>

			<div class="p-6 sm:p-8">
				<h3 class="display text-3xl text-balance">{current.title}</h3>
				<dl class="mt-5 grid grid-cols-2 gap-4 border-y border-white/10 py-4 text-sm">
					<div><dt class="text-ink-400">{t('projects.category')}</dt><dd class="font-semibold">{current.category}</dd></div>
					{#if current.location}
						<div><dt class="text-ink-400">Locatie</dt><dd class="font-semibold">{current.location}</dd></div>
					{/if}
					{#if current.clientType}
						<div><dt class="text-ink-400">Klant</dt><dd class="font-semibold">{current.clientType}</dd></div>
					{/if}
					{#if formatDate(current.completionDate)}
						<div><dt class="text-ink-400">Opgeleverd</dt><dd class="font-semibold">{formatDate(current.completionDate)}</dd></div>
					{/if}
					<div><dt class="text-ink-400">Foto's</dt><dd class="font-semibold">{current.images.length}</dd></div>
				</dl>
				<div class="mt-5 space-y-3 leading-relaxed text-ink-200">
					<RichText text={current.description || current.summary} tone="dark" />
				</div>
				{#if current.images.length > 1}
					<ul class="mt-6 grid grid-cols-4 gap-2">
						{#each current.images as im, ii (im.id)}
							<li>
								<button
									type="button"
									onclick={() => (index = ii)}
									aria-current={ii === index}
									class="block aspect-square w-full overflow-hidden rounded-sm ring-2 transition {ii === index
										? 'ring-brand-500'
										: 'opacity-60 ring-transparent hover:opacity-100'}"
								>
									<img src={im.thumbUrl ?? im.imageUrl} alt="" class="h-full w-full object-cover" loading="lazy" />
									<span class="sr-only">Foto {ii + 1}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				<button
					type="button"
					onclick={() => {
						const category = current!.category;
						open = false;
						requestQuoteFor(category);
					}}
					class="btn-primary mt-8 w-full"
				>
					{t('projects.quote')}
					<Icon name="arrow-right" class="h-4 w-4" />
				</button>
			</div>
		</div>
	{/if}
</Modal>
