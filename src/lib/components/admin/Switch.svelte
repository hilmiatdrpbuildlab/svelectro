<script lang="ts">
	let {
		name,
		checked = $bindable(false),
		label,
		description
	}: { name: string; checked?: boolean; label: string; description?: string } = $props();
</script>

<label class="flex cursor-pointer items-start justify-between gap-4 rounded-md bg-white p-4 ring-1 ring-ink-100">
	<span>
		<span class="block font-semibold text-ink-900">{label}</span>
		{#if description}<span class="mt-0.5 block text-sm text-ink-500">{description}</span>{/if}
	</span>
	<input type="checkbox" {name} bind:checked class="peer sr-only" role="switch" />
	<span
		class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-brand-600 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
		aria-hidden="true"
	></span>
</label>
