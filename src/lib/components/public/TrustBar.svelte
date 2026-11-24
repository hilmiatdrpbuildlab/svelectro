<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { TrustItem } from '$lib/content';

	let { items, projectCount }: { items: TrustItem[]; projectCount: number } = $props();
</script>

<section aria-label="Waarom SV Electro" class="border-b border-ink-100 bg-white">
	<ul class="container-x grid divide-y divide-ink-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
		{#each items.slice(0, 4) as item, i (item.title)}
			<li class="flex items-start gap-4 py-6 sm:py-7 lg:px-7 {i === 0 ? 'lg:pl-0' : ''}">
				<span class="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
					<Icon name={item.icon} class="h-5 w-5" />
				</span>
				<div>
					<p class="font-condensed text-lg leading-tight font-extrabold text-ink-950 uppercase">
						{#if item.title.includes('{projecten}')}
							{item.title.replace('{projecten}', String(projectCount))}
						{:else}
							{item.title}
						{/if}
					</p>
					<p class="mt-1 text-sm leading-snug text-ink-500">{item.text}</p>
				</div>
			</li>
		{/each}
	</ul>
</section>
