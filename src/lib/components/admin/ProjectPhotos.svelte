<script lang="ts">
	import { enhance } from '$app/forms';
	import { optimiseFormImages } from '$lib/client/image';
	import Icon from '$lib/components/Icon.svelte';
	import { flip } from 'svelte/animate';

	interface Photo {
		id: string;
		imageUrl: string;
		thumbUrl: string | null;
		caption: string;
		isCover: boolean;
	}
	let { images }: { images: Photo[] } = $props();

	// Local, reorderable copy; reset whenever the server sends a new list.
	let items = $state<Photo[]>([]);
	let dirty = $state(false);
	$effect(() => {
		items = images.map((i) => ({ ...i }));
		dirty = false;
	});

	// ---- upload -------------------------------------------------------------------------
	let uploadForm: HTMLFormElement | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();
	let uploading = $state<string | null>(null);
	let dropActive = $state(false);

	function submitFiles(files: FileList | null | undefined) {
		if (!files?.length || !fileInput || !uploadForm) return;
		fileInput.files = files;
		uploadForm.requestSubmit();
	}

	// ---- drag to reorder ----------------------------------------------------------------
	let dragId = $state<string | null>(null);
	function onDragOver(e: DragEvent, overId: string) {
		if (!dragId || dragId === overId) return;
		e.preventDefault();
		const from = items.findIndex((i) => i.id === dragId);
		const to = items.findIndex((i) => i.id === overId);
		const next = [...items];
		next.splice(to, 0, next.splice(from, 1)[0]);
		items = next;
		dirty = true;
	}
	function move(index: number, dir: -1 | 1) {
		const j = index + dir;
		if (j < 0 || j >= items.length) return;
		const next = [...items];
		[next[index], next[j]] = [next[j], next[index]];
		items = next;
		dirty = true;
	}
</script>

<section class="rounded-lg bg-white ring-1 ring-ink-100">
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
		<div>
			<h2 class="font-condensed text-xl font-extrabold text-ink-950 uppercase">Foto's</h2>
			<p class="text-sm text-ink-500">Sleep om de volgorde te wijzigen. De omslagfoto verschijnt in het overzicht.</p>
		</div>
		<span class="text-sm font-semibold text-ink-500">{items.length} foto{items.length === 1 ? '' : "'s"}</span>
	</div>

	<!-- Upload: drop zone + multi-file picker. Photos are optimised in the browser first. -->
	<form
		bind:this={uploadForm}
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		class="p-5"
		use:enhance={async ({ formData }) => {
			const n = formData.getAll('images').filter((f) => f instanceof File && f.size).length;
			uploading = `${n} foto${n === 1 ? '' : "'s"} optimaliseren…`;
			await optimiseFormImages(formData, 'images', { max: 2000, thumb: 720 });
			uploading = `${n} foto${n === 1 ? '' : "'s"} uploaden…`;
			return async ({ update }) => {
				await update();
				uploading = null;
				if (fileInput) fileInput.value = '';
			};
		}}
	>
		<label
			class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition {dropActive
				? 'border-brand-500 bg-brand-50'
				: 'border-ink-200 hover:border-ink-400'} {uploading ? 'pointer-events-none opacity-70' : ''}"
			ondragover={(e) => {
				if (e.dataTransfer?.types.includes('Files')) {
					e.preventDefault();
					dropActive = true;
				}
			}}
			ondragleave={() => (dropActive = false)}
			ondrop={(e) => {
				e.preventDefault();
				dropActive = false;
				submitFiles(e.dataTransfer?.files);
			}}
		>
			{#if uploading}
				<span class="h-8 w-8 animate-spin rounded-full border-3 border-ink-200 border-t-brand-600"></span>
				<span class="font-semibold text-ink-800" aria-live="polite">{uploading}</span>
			{:else}
				<span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-700">
					<Icon name="upload" class="h-6 w-6" />
				</span>
				<span class="font-semibold text-ink-900">Sleep foto's hierheen of klik om te kiezen</span>
				<span class="text-sm text-ink-500">JPG, PNG of WebP, meerdere tegelijk. Max. 12 MB per foto.</span>
			{/if}
			<input
				bind:this={fileInput}
				type="file"
				name="images"
				accept="image/jpeg,image/png,image/webp"
				multiple
				class="sr-only"
				onchange={(e) => e.currentTarget.files?.length && uploadForm?.requestSubmit()}
			/>
		</label>
		<noscript><button class="btn-outline btn-sm mt-3">Uploaden</button></noscript>
	</form>

	{#if items.length}
		<form
			method="POST"
			action="?/saveImages"
			use:enhance={({ action, cancel }) => {
				if (action.search.includes('deleteImage') && !confirm('Deze foto definitief verwijderen?')) cancel();
				return async ({ update }) => update({ reset: false });
			}}
			class="px-5 pb-5"
		>
			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as img, i (img.id)}
					<li
						animate:flip={{ duration: 200 }}
						draggable="true"
						ondragstart={(e) => {
							dragId = img.id;
							e.dataTransfer?.setData('text/plain', img.id);
						}}
						ondragend={() => (dragId = null)}
						ondragover={(e) => onDragOver(e, img.id)}
						class="group overflow-hidden rounded-md bg-ink-50 ring-1 transition {dragId === img.id
							? 'opacity-40 ring-brand-500'
							: img.isCover
								? 'ring-2 ring-brand-500'
								: 'ring-ink-100'}"
					>
						<input type="hidden" name="imageId" value={img.id} />
						<div class="relative aspect-[4/3] cursor-grab bg-ink-200 active:cursor-grabbing">
							<img src={img.thumbUrl ?? img.imageUrl} alt="" class="h-full w-full object-cover" loading="lazy" draggable="false" />
							<span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-ink-950/75 px-1.5 py-1 text-xs font-bold text-white">
								<Icon name="grip" class="h-3.5 w-3.5" />{i + 1}
							</span>
							{#if img.isCover}
								<span class="absolute top-2 right-2 rounded-sm bg-brand-600 px-2 py-1 text-xs font-bold text-white">Omslag</span>
							{/if}
						</div>
						<div class="space-y-2 p-3">
							<label class="sr-only" for="cap-{img.id}">Bijschrift foto {i + 1}</label>
							<input
								id="cap-{img.id}"
								name="caption_{img.id}"
								bind:value={img.caption}
								oninput={() => (dirty = true)}
								placeholder="Bijschrift (optioneel)"
								class="field !py-2 text-sm"
							/>
							<div class="flex items-center gap-1">
								<button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-white hover:text-ink-900 disabled:opacity-30" disabled={i === 0} onclick={() => move(i, -1)} aria-label="Naar voren"><Icon name="chevron-left" class="h-4 w-4" /></button>
								<button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-white hover:text-ink-900 disabled:opacity-30" disabled={i === items.length - 1} onclick={() => move(i, 1)} aria-label="Naar achteren"><Icon name="chevron-right" class="h-4 w-4" /></button>
								<span class="flex-1"></span>
								{#if !img.isCover}
									<button formaction="?/setCover" name="targetId" value={img.id} class="rounded px-2 py-1.5 text-xs font-bold text-ink-700 hover:bg-white">Als omslag</button>
								{/if}
								<button formaction="?/deleteImage" name="targetId" value={img.id} class="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-brand-50 hover:text-brand-700" aria-label="Foto verwijderen"><Icon name="trash" class="h-4 w-4" /></button>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div
				class="sticky bottom-4 mt-5 flex items-center justify-between gap-3 rounded-md px-4 py-3 transition {dirty
					? 'bg-ink-950 text-white shadow-2xl'
					: 'bg-ink-50 text-ink-500'}"
			>
				<span class="text-sm font-semibold">{dirty ? 'Niet-opgeslagen wijzigingen aan volgorde of bijschriften' : 'Volgorde en bijschriften'}</span>
				<button class="btn-primary btn-sm" disabled={!dirty}>Opslaan</button>
			</div>
		</form>
	{/if}
</section>
