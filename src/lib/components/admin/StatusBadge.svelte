<script lang="ts">
	import { statusMeta } from '$lib/content';
	let { status }: { status: string } = $props();
	const meta = $derived(statusMeta(status));
</script>

<span class="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset {meta.tone}">{meta.label}</span>
