<script lang="ts">
	import Seo from '$lib/components/public/Seo.svelte';

	let { data } = $props();
	const c = $derived(data.settings.company);
</script>

<Seo
	settings={data.settings}
	path="/privacy"
	title="Privacybeleid | {c.legalName}"
	description="Hoe {c.legalName} omgaat met de persoonsgegevens die u via deze website doorgeeft."
/>

<article class="container-x max-w-3xl py-16 sm:py-24">
	<h1 class="display text-5xl text-ink-950 sm:text-6xl">Privacybeleid</h1>
	<div class="mt-10 space-y-8 text-lg leading-relaxed text-ink-700 [&_h2]:font-condensed [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-ink-950 [&_h2]:uppercase">
		<section>
			<h2>Wie zijn wij?</h2>
			<p class="mt-3">
				{c.legalName}, {c.street}, {c.postalCode} {c.city}, BTW {c.vat}, is verantwoordelijk voor de verwerking van de
				persoonsgegevens op deze website. Vragen? Mail naar <a class="font-semibold text-brand-600 underline" href="mailto:{c.email}">{c.email}</a>.
			</p>
		</section>
		<section>
			<h2>Welke gegevens verwerken we?</h2>
			<p class="mt-3">
				Wanneer u het offerteformulier invult, verwerken we uw naam, e-mailadres, telefoonnummer, gemeente, de
				beschrijving van uw project en een eventuele bijlage. We gebruiken die gegevens uitsluitend om uw aanvraag te
				beantwoorden en een offerte op te maken (rechtsgrond: precontractuele maatregelen op uw verzoek).
			</p>
		</section>
		<section>
			<h2>Bewaring en delen</h2>
			<p class="mt-3">
				Uw gegevens worden veilig opgeslagen bij onze hostingpartners binnen de Europese Unie en niet verkocht of gedeeld
				met derden voor marketing. We bewaren ze niet langer dan nodig voor uw aanvraag, de opvolging ervan en onze
				wettelijke verplichtingen.
			</p>
		</section>
		<section>
			<h2>Cookies</h2>
			<p class="mt-3">
				Deze website gebruikt geen tracking- of advertentiecookies. Enkel het beheerpaneel gebruikt een strikt
				noodzakelijke sessiecookie.
			</p>
		</section>
		<section>
			<h2>Uw rechten</h2>
			<p class="mt-3">
				U hebt het recht op inzage, verbetering en verwijdering van uw gegevens. Stuur daarvoor een e-mail naar
				{c.email}. Bent u niet tevreden, dan kunt u klacht indienen bij de Gegevensbeschermingsautoriteit
				(www.gegevensbeschermingsautoriteit.be).
			</p>
		</section>
	</div>
</article>
