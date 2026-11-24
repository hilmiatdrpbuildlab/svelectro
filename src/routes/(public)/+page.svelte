<script lang="ts">
	import About from '$lib/components/public/About.svelte';
	import Contact from '$lib/components/public/Contact.svelte';
	import Hero from '$lib/components/public/Hero.svelte';
	import Portfolio from '$lib/components/public/Portfolio.svelte';
	import Seo from '$lib/components/public/Seo.svelte';
	import Services from '$lib/components/public/Services.svelte';
	import Testimonials from '$lib/components/public/Testimonials.svelte';
	import TrustBar from '$lib/components/public/TrustBar.svelte';

	let { data, form } = $props();
	const s = $derived(data.settings);
	const serviceTitles = $derived(data.services.map((x) => x.title));
</script>

<Seo settings={s} services={data.services} />

<Hero hero={s.hero} company={s.company} />
<TrustBar items={s.trust} projectCount={data.projects.length} />
{#if data.services.length}<Services services={data.services} />{/if}
{#if data.projects.length}<Portfolio projects={data.projects} />{/if}
<About about={s.about} company={s.company} />
{#if data.testimonials.length}<Testimonials reviews={data.testimonials} />{/if}
<Contact company={s.company} {serviceTitles} {form} />
