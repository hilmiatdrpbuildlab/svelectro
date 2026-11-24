<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let {
		title,
		description,
		back,
		actions
	}: { title: string; description?: string; back?: { href: string; label: string }; actions?: Snippet } = $props();
</script>

<div class="mb-8">
	{#if back}
		<a href={back.href} class="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
			<Icon name="chevron-left" class="h-4 w-4" />{back.label}
		</a>
	{/if}
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="display text-4xl text-ink-950 sm:text-5xl">{title}</h1>
			{#if description}<p class="mt-2 text-ink-500">{description}</p>{/if}
		</div>
		{#if actions}<div class="flex shrink-0 flex-wrap gap-2">{@render actions()}</div>{/if}
	</div>
</div>
