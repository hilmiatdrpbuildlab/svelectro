<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	/** Native <dialog>: focus trap, Escape and inert background come for free. */
	let {
		open = $bindable(false),
		label,
		size = 'md',
		tone = 'light',
		children
	}: {
		open?: boolean;
		label: string;
		size?: 'md' | 'lg' | 'full';
		tone?: 'light' | 'dark';
		children: Snippet;
	} = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	const widths = { md: 'max-w-2xl', lg: 'max-w-5xl', full: 'max-w-none' };
</script>

<dialog
	bind:this={dialog}
	aria-label={label}
	onclose={() => (open = false)}
	onclick={(e) => e.target === dialog && (open = false)}
	class="m-auto max-h-[100dvh] w-full overflow-visible bg-transparent p-0 backdrop:bg-ink-950/80 backdrop:backdrop-blur-sm open:animate-[dialogIn_.28s_var(--ease-snap)] {widths[
		size
	]} {size === 'full' ? 'h-[100dvh]' : 'sm:max-h-[92dvh] sm:px-4'}"
>
	{#if open}
		<div
			class="relative max-h-[100dvh] overflow-y-auto {size === 'full' ? 'h-full' : 'sm:max-h-[92dvh] sm:rounded-lg'} {tone ===
			'dark'
				? 'bg-ink-950 text-white'
				: 'bg-white text-ink-800'} shadow-2xl"
		>
			<button
				type="button"
				onclick={() => (open = false)}
				class="absolute top-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-md bg-ink-950/70 text-white backdrop-blur transition hover:bg-ink-950"
			>
				<Icon name="x" class="h-5 w-5" />
				<span class="sr-only">Sluiten</span>
			</button>
			{@render children()}
		</div>
	{/if}
</dialog>

<style>
	@keyframes -global-dialogIn {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
	}
</style>
