<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { telHref, type CompanySettings, type HeroSettings } from '$lib/content';

	let { hero, company }: { hero: HeroSettings; company: CompanySettings } = $props();
</script>

<section class="relative isolate overflow-hidden bg-ink-950 text-white">
	<div class="bg-blueprint absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"></div>

	<div class="container-x grid items-center gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
		<div class="max-w-2xl">
			<h1 class="display text-[clamp(3.2rem,9vw,6rem)] text-balance">
				{hero.title}
				<span class="switch-on block text-brand-500">{hero.titleAccent}</span>
			</h1>
			<p class="mt-7 max-w-xl text-lg leading-relaxed text-ink-200 sm:text-xl">{hero.subtitle}</p>

			<div id="hero-cta" class="mt-9 flex flex-col gap-3 sm:flex-row">
				<a href="#offerte" class="btn-primary text-base">
					{hero.ctaPrimary}
					<Icon name="arrow-right" class="h-4 w-4" />
				</a>
				<a href="#realisaties" class="btn-ghost-light text-base">{hero.ctaSecondary}</a>
			</div>

			<div class="mt-8 flex flex-col gap-2 text-sm text-ink-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
				{#if hero.eyebrow}
					<p class="flex items-center gap-2 font-semibold text-ink-100">
						<Icon name="shield-check" class="h-4 w-4 shrink-0 text-brand-500" />
						{hero.eyebrow}
					</p>
				{/if}
				<p class="flex flex-wrap items-center gap-x-2">
					<span>Of bel meteen:</span>
					<a href={telHref(company.phone)} class="font-bold text-white tabular-nums underline-offset-4 hover:underline">
						{company.phone}
					</a>
				</p>
			</div>
		</div>

		<div class="relative">
			<div class="relative aspect-[4/5] overflow-hidden rounded-lg bg-ink-800 sm:aspect-[5/4] lg:aspect-[4/5]">
				{#if hero.imageUrl}
					<img
						src={hero.imageUrl}
						alt={hero.imageAlt}
						class="h-full w-full object-cover"
						fetchpriority="high"
						decoding="async"
						width="1200"
						height="1500"
					/>
				{/if}
				<div class="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent"></div>
			</div>
			<!-- Corner brackets, like the marks on an electrical drawing -->
			<span class="bracket bracket-tl absolute -top-3 -left-3 h-14 w-14 border-t-4 border-l-4 border-brand-500" aria-hidden="true"></span>
			<span class="bracket bracket-br absolute -right-3 -bottom-3 h-14 w-14 border-r-4 border-b-4 border-brand-500" aria-hidden="true"></span>

			{#if hero.badge}
				<div
					class="absolute bottom-5 left-5 flex items-center gap-3 rounded-md bg-white py-3 pr-5 pl-3 text-ink-900 shadow-xl sm:bottom-8 sm:left-8"
				>
					<span class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 text-white">
						<Icon name="ev-charger" class="h-5 w-5" />
					</span>
					<span class="text-sm leading-tight font-bold">{hero.badge}</span>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/*
	 * One authored moment on load, from the "Installer's Drawing" world:
	 * the corner brackets register onto the photo like the marks on a drawing (2 times),
	 * and the accent word flickers on like a light bulb in warm yellow (2 times), then
	 * settles back to its own Live-Wire orange. Both stop for good after the second run.
	 * Everything is fully visible in its final state if animations never run.
	 */
	.bracket {
		animation: register 650ms cubic-bezier(0.16, 1, 0.3, 1) 2 both;
	}
	.bracket-tl {
		--from: 14px, 14px;
		transform-origin: top left;
		animation-delay: 150ms;
	}
	.bracket-br {
		--from: -14px, -14px;
		transform-origin: bottom right;
		animation-delay: 280ms;
	}
	@keyframes register {
		from {
			opacity: 0;
			transform: translate(var(--from)) scale(0.6);
		}
	}

	/* Fill mode "backwards" (not "both"): once the second flicker ends, the word drops the
	   animation and shows its normal text-brand-500 orange again. About 2 flashes per second,
	   under the 3-per-second photosensitivity limit. */
	.switch-on {
		--bulb: #ffd23f;
		animation: switch-on 900ms linear 450ms 2 backwards;
	}
	@keyframes switch-on {
		0%,
		30% {
			color: var(--color-ink-700);
		}
		38% {
			color: var(--bulb);
		}
		46% {
			color: var(--color-ink-600);
		}
		56%,
		100% {
			color: var(--bulb);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bracket,
		.switch-on {
			animation: none;
		}
	}
</style>
