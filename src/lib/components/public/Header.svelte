<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { telHref, type CompanySettings } from '$lib/content';
	import { t } from '$lib/i18n';

	let { company }: { company: CompanySettings } = $props();

	const links = [
		{ href: '#diensten', label: t('nav.services') },
		{ href: '#realisaties', label: t('nav.projects') },
		{ href: '#over-ons', label: t('nav.about') },
		{ href: '#contact', label: t('nav.contact') }
	];

	let open = $state(false);
	let scrolled = $state(false);
	let current = $state('');

	// Marks the section in view so the menu shows where you are on the page.
	$effect(() => {
		const sections = links
			.map((l) => document.getElementById(l.href.slice(1)))
			.filter((el): el is HTMLElement => !!el);
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) current = `#${e.target.id}`;
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		sections.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		document.documentElement.style.overflow = open ? 'hidden' : '';
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (open = false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<a
	href="#inhoud"
	class="sr-only z-[60] rounded-md bg-white px-4 py-2 font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	{t('nav.skip')}
</a>

<header
	class="sticky top-0 z-50 border-b transition-colors duration-300 {scrolled
		? 'border-white/10 bg-ink-950/90 backdrop-blur-md'
		: 'border-transparent bg-ink-950'}"
>
	<nav class="container-x flex h-[4.5rem] items-center justify-between gap-6" aria-label="Hoofdmenu">
		<a href="/" class="rounded-sm" aria-label="{company.name}, naar de startpagina">
			<Logo tone="light" />
		</a>

		<ul class="hidden items-center gap-1 lg:flex">
			{#each links as l (l.href)}
				<li>
					<a
						href={l.href}
						aria-current={current === l.href ? 'location' : undefined}
						class="relative rounded-md px-3.5 py-2 text-[0.95rem] font-semibold text-ink-200 transition hover:text-white after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-500 after:transition-transform hover:after:scale-x-100 aria-[current]:text-white aria-[current]:after:scale-x-100"
					>
						{l.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="flex items-center gap-2 sm:gap-3">
			<a
				href={telHref(company.phone)}
				class="hidden items-center gap-2 rounded-md px-3 py-2 text-[0.95rem] font-semibold text-white transition hover:text-brand-300 md:inline-flex"
			>
				<Icon name="phone" class="h-4 w-4 text-brand-500" />
				<span class="tabular-nums">{company.phone}</span>
			</a>
			<a href="#offerte" class="btn-primary hidden !min-h-11 sm:inline-flex">
				{t('nav.cta')}
				<Icon name="arrow-right" class="h-4 w-4" />
			</a>
			<button
				type="button"
				class="inline-flex h-11 w-11 items-center justify-center rounded-md text-white ring-1 ring-white/20 lg:hidden"
				aria-expanded={open}
				aria-controls="mobiel-menu"
				onclick={() => (open = !open)}
			>
				<span class="sr-only">{open ? t('nav.close') : t('nav.menu')}</span>
				<Icon name={open ? 'x' : 'menu'} class="h-5 w-5" />
			</button>
		</div>
	</nav>

	{#if open}
		<div id="mobiel-menu" class="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 overflow-y-auto bg-ink-950 lg:hidden">
			<ul class="container-x flex flex-col py-4">
				{#each links as l, i (l.href)}
					<li style="animation-delay:{i * 40}ms" class="animate-[menuIn_.3s_var(--ease-snap)_both]">
						<a
							href={l.href}
							onclick={() => (open = false)}
							class="display flex items-center justify-between border-b border-white/10 py-5 text-4xl text-white"
						>
							{l.label}
							<Icon name="arrow-right" class="h-6 w-6 text-brand-500" />
						</a>
					</li>
				{/each}
			</ul>
			<div class="container-x grid gap-3 pt-2 pb-10">
				<a href={telHref(company.phone)} class="btn-ghost-light w-full">
					<Icon name="phone" class="h-4 w-4" />
					{company.phone}
				</a>
				<a href="#offerte" onclick={() => (open = false)} class="btn-primary w-full">{t('nav.cta')}</a>
			</div>
		</div>
	{/if}
</header>

<style>
	@keyframes -global-menuIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
</style>
