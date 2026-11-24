<script lang="ts">
	import Footer from '$lib/components/public/Footer.svelte';
	import Header from '$lib/components/public/Header.svelte';
	import MobileBar from '$lib/components/public/MobileBar.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();
	const company = $derived(data.settings.company);
	const accent = $derived(/^#[0-9a-f]{6}$/i.test(data.settings.theme.accent) ? data.settings.theme.accent : '');
	const footerServices = $derived(
		((page.data as { services?: { title: string; slug: string }[] }).services ?? []).map((s) => ({
			title: s.title,
			slug: s.slug
		}))
	);
</script>

<svelte:head>
	{#if accent}
		{@html `<style>:root{--brand-accent:${accent}}</style>`}
	{/if}
</svelte:head>

<Header {company} />
<main id="inhoud">
	{@render children()}
</main>
<Footer {company} services={footerServices} />
<MobileBar phone={company.phone} />
