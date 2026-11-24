<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { fly } from 'svelte/transition';

	/** Shows `form.message` (success) or `form.error` returned by any admin form action. */
	let shown = $state<{ text: string; tone: 'ok' | 'error'; id: number } | null>(null);
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const f = page.form as { message?: string; error?: string } | null;
		const text = f?.message ?? f?.error;
		if (!text) return;
		shown = { text, tone: f?.error ? 'error' : 'ok', id: Date.now() };
		clearTimeout(timer);
		timer = setTimeout(() => (shown = null), f?.error ? 7000 : 3500);
	});
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" aria-live="polite">
	{#if shown}
		{#key shown.id}
			<div
				transition:fly={{ y: 16, duration: 220 }}
				role={shown.tone === 'error' ? 'alert' : 'status'}
				class="pointer-events-auto flex max-w-md items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold shadow-2xl {shown.tone ===
				'error'
					? 'bg-brand-700 text-white'
					: 'bg-ink-950 text-white'}"
			>
				<Icon name={shown.tone === 'error' ? 'x' : 'check'} class="h-4 w-4 shrink-0 {shown.tone === 'error' ? '' : 'text-brand-500'}" />
				{shown.text}
			</div>
		{/key}
	{/if}
</div>
