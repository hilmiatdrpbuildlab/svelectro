<script lang="ts">
	import type { SiteSettings } from '$lib/content';

	let {
		settings,
		path = '/',
		title,
		description,
		services = []
	}: {
		settings: SiteSettings;
		path?: string;
		title?: string;
		description?: string;
		services?: { title: string; shortDescription: string }[];
	} = $props();

	const c = $derived(settings.company);
	const base = $derived(settings.seo.siteUrl.replace(/\/+$/, ''));
	const url = $derived(base + path);
	const metaTitle = $derived(title ?? settings.seo.title);
	const metaDescription = $derived(description ?? settings.seo.description);
	const image = $derived(settings.seo.ogImageUrl || settings.hero.imageUrl);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': ['Electrician', 'LocalBusiness'],
		'@id': `${base}/#business`,
		name: c.legalName,
		alternateName: c.name,
		slogan: c.tagline,
		url: base,
		logo: `${base}/apple-touch-icon.png`,
		image: image || undefined,
		description: settings.seo.description,
		telephone: c.phone.replace(/\s+/g, ''),
		email: c.email,
		vatID: c.vat.replace(/\s|\./g, ''),
		founder: c.owner ? { '@type': 'Person', name: c.owner } : undefined,
		address: {
			'@type': 'PostalAddress',
			streetAddress: c.street,
			postalCode: c.postalCode,
			addressLocality: c.city,
			addressRegion: 'Antwerpen',
			addressCountry: 'BE'
		},
		geo:
			c.latitude != null && c.longitude != null
				? { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude }
				: undefined,
		areaServed: [
			{ '@type': 'AdministrativeArea', name: 'Zuiderkempen' },
			{ '@type': 'City', name: c.city }
		],
		sameAs: [c.facebook, c.instagram, c.linkedin].filter(Boolean),
		hasOfferCatalog: services.length
			? {
					'@type': 'OfferCatalog',
					name: 'Elektriciteitswerken',
					itemListElement: services.map((s) => ({
						'@type': 'Offer',
						itemOffered: { '@type': 'Service', name: s.title, description: s.shortDescription }
					}))
				}
			: undefined
	});

	// `</` inside JSON would end the script element early.
	const ldScript = $derived(
		`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</` + `script>`
	);
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="nl_BE" />
	<meta property="og:site_name" content={c.legalName} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={url} />
	{#if image}
		<meta property="og:image" content={image} />
		<meta name="twitter:image" content={image} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metaTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="geo.region" content="BE-VAN" />
	<meta name="geo.placename" content={c.city} />
	{#if c.latitude != null && c.longitude != null}
		<meta name="geo.position" content="{c.latitude};{c.longitude}" />
	{/if}
	{@html ldScript}
</svelte:head>
