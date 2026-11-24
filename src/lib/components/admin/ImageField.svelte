<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * Single-image picker with live preview. The surrounding form's enhance callback runs
	 * optimiseFormImages(formData, name), which adds the `<name>_thumb/_w/_h` fields.
	 */
	let {
		name,
		label,
		current = null,
		hint = 'JPG, PNG of WebP. Wordt automatisch verkleind en naar WebP omgezet.',
		removable = false
	}: { name: string; label: string; current?: string | null; hint?: string; removable?: boolean } = $props();

	let preview = $state<string | null>(null);
	let remove = $state(false);
	let dragging = $state(false);
	let input: HTMLInputElement | undefined = $state();

	function pick(files: FileList | null | undefined) {
		const f = files?.[0];
		if (preview) URL.revokeObjectURL(preview);
		preview = f ? URL.createObjectURL(f) : null;
		if (f) remove = false;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (!e.dataTransfer?.files.length || !input) return;
		input.files = e.dataTransfer.files;
		pick(input.files);
	}

	const shown = $derived(preview ?? (remove ? null : current));
</script>

<div>
	<span class="field-label">{label}</span>
	<div
		class="relative flex flex-col gap-4 rounded-md border-2 border-dashed p-3 transition sm:flex-row sm:items-center {dragging
			? 'border-brand-500 bg-brand-50'
			: 'border-ink-200 bg-white'}"
		role="group"
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={onDrop}
	>
		<div class="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm bg-ink-100 sm:w-44">
			{#if shown}
				<img src={shown} alt="" class="h-full w-full object-cover" />
			{:else}
				<div class="flex h-full items-center justify-center text-ink-400"><Icon name="image" class="h-8 w-8" /></div>
			{/if}
		</div>
		<div class="min-w-0 flex-1 text-sm">
			<label class="btn-outline btn-sm cursor-pointer">
				<Icon name="upload" class="h-4 w-4" />
				{shown ? 'Andere afbeelding' : 'Afbeelding kiezen'}
				<input
					bind:this={input}
					type="file"
					{name}
					accept="image/jpeg,image/png,image/webp"
					class="sr-only"
					onchange={(e) => pick(e.currentTarget.files)}
				/>
			</label>
			<p class="mt-2 text-ink-500">{hint} Of sleep een bestand hierheen.</p>
			{#if removable && current && !preview}
				<label class="mt-2 inline-flex items-center gap-2 text-ink-700">
					<input type="checkbox" name="{name}_remove" bind:checked={remove} class="rounded border-ink-300 text-brand-600" />
					Afbeelding verwijderen
				</label>
			{/if}
		</div>
	</div>
</div>
