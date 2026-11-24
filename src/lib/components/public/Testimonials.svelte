<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { t } from '$lib/i18n';

	interface Review {
		id: string;
		clientName: string;
		companyOrCity: string | null;
		rating: number;
		quote: string;
		project: { title: string; category: string } | null;
	}
	let { reviews }: { reviews: Review[] } = $props();
	const average = $derived(reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1));
</script>

<section class="bg-ink-50 py-20 sm:py-28" aria-labelledby="reviews-titel">
	<div class="container-x">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<h2 id="reviews-titel" class="display text-[clamp(2.4rem,5.5vw,4rem)] text-balance text-ink-950">
				{t('testimonials.title')}
			</h2>
			<p class="flex items-center gap-2 text-ink-700">
				<span class="font-condensed text-4xl font-extrabold text-ink-950">{average.toFixed(1).replace('.', ',')}</span>
				<span class="text-sm">/ 5 gemiddeld<br />op {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
			</p>
		</div>

		<ul class="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each reviews as r (r.id)}
				<li class="flex flex-col rounded-lg bg-white p-7 ring-1 ring-ink-100">
					<div class="flex gap-0.5 text-brand-500" role="img" aria-label="{r.rating} op 5 sterren">
						{#each Array(5) as _, i (i)}
							<Icon name="star" class="h-5 w-5 {i < r.rating ? '' : 'text-ink-200'}" filled stroke={0} />
						{/each}
					</div>
					<blockquote class="mt-5 flex-1 text-lg leading-relaxed text-ink-800">“{r.quote}”</blockquote>
					<div class="mt-6 flex items-end justify-between gap-4 border-t border-ink-100 pt-5">
						<p>
							<span class="block font-bold text-ink-950">{r.clientName}</span>
							{#if r.companyOrCity}<span class="text-sm text-ink-500">{r.companyOrCity}</span>{/if}
						</p>
						{#if r.project}
							<span class="rounded-sm bg-ink-50 px-2 py-1 text-xs font-bold tracking-wide text-ink-600 uppercase">
								{r.project.category}
							</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>
