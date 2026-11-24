<script lang="ts">
	import { toBlocks } from '$lib/text';
	import Icon from './Icon.svelte';

	let { text, tone = 'light' }: { text: string; tone?: 'light' | 'dark' } = $props();
	const blocks = $derived(toBlocks(text));
</script>

{#each blocks as b, i (i)}
	{#if b.kind === 'p'}
		<p class="whitespace-pre-line">{b.text}</p>
	{:else}
		{#if b.heading}<p class="font-semibold {tone === 'dark' ? 'text-white' : 'text-ink-900'}">{b.heading}</p>{/if}
		<ul class="space-y-1.5">
			{#each b.items as item, j (j)}
				<li class="flex gap-2">
					<Icon name="check" class="mt-1 h-4 w-4 shrink-0 {tone === 'dark' ? 'text-brand-500' : 'text-brand-600'}" />
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	{/if}
{/each}
