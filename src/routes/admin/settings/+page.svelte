<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { optimiseFormImages } from '$lib/client/image';
	import Icon from '$lib/components/Icon.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import { ICON_NAMES } from '$lib/content';

	let { data, form } = $props();
	const s = $derived(data.settings);
	const f = $derived(form as { section?: string; errors?: Record<string, string> } | null);
	const err = (section: string, k: string) => (f?.section === section ? f.errors?.[k] : undefined);

	const sections = [
		{ id: 'hero', label: 'Hero' },
		{ id: 'company', label: 'Bedrijf & contact' },
		{ id: 'about', label: 'Over ons' },
		{ id: 'trust', label: 'Vertrouwensbalk' },
		{ id: 'seo', label: 'SEO' },
		{ id: 'theme', label: 'Kleur' }
	];

	let saving = $state<string | null>(null);
	const submit =
		(section: string, withImage = false): SubmitFunction =>
		async ({ formData }) => {
			saving = section;
			if (withImage) await optimiseFormImages(formData, 'image', { max: 2000, thumb: false });
			return async ({ update }) => {
				await update({ reset: false });
				saving = null;
			};
		};

	let accent = $state('#d42a00');
	$effect(() => {
		accent = s.theme.accent || '#d42a00';
	});
</script>

<PageHeader title="Instellingen" description="Teksten, contactgegevens en SEO van de website. Wijzigingen zijn binnen een minuut zichtbaar." />

<nav class="-mx-4 mb-6 overflow-x-auto px-4" aria-label="Secties">
	<ul class="flex w-max gap-1">
		{#each sections as sec (sec.id)}
			<li><a href="#{sec.id}" class="inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 hover:ring-ink-400">{sec.label}</a></li>
		{/each}
	</ul>
</nav>

{#snippet saveBar(section: string)}
	<div class="flex items-center justify-end border-t border-ink-100 pt-5">
		<button class="btn-primary btn-sm" disabled={saving === section}>{saving === section ? 'Opslaan…' : 'Opslaan'}</button>
	</div>
{/snippet}

{#snippet text(section: string, name: string, label: string, value: string, opts: { hint?: string; type?: string; full?: boolean; max?: number } = {})}
	<div class={opts.full ? 'sm:col-span-2' : ''}>
		<label for="{section}-{name}" class="field-label">{label}</label>
		<input id="{section}-{name}" {name} type={opts.type ?? 'text'} {value} maxlength={opts.max} aria-invalid={err(section, name) ? 'true' : undefined} class="field" />
		{#if err(section, name)}<p class="field-error">{err(section, name)}</p>{:else if opts.hint}<p class="mt-1 text-xs text-ink-500">{opts.hint}</p>{/if}
	</div>
{/snippet}

<div class="space-y-8">
	<!-- HERO -->
	<section id="hero" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">Hero</h2>
		<p class="mb-5 text-sm text-ink-500">Het eerste wat bezoekers zien.</p>
		<form method="POST" action="?/hero" enctype="multipart/form-data" use:enhance={submit('hero', true)} class="grid gap-5 sm:grid-cols-2">
			{@render text('hero', 'eyebrow', 'Erkenning en regio (naast het telefoonnummer)', s.hero.eyebrow, {
				full: true,
				hint: 'Bv. “Erkend elektricien · Heist-op-den-Berg”. Vermeld enkel wat klopt.'
			})}
			{@render text('hero', 'title', 'Titel (wit)', s.hero.title)}
			{@render text('hero', 'titleAccent', 'Titel (rood, tweede regel)', s.hero.titleAccent)}
			<div class="sm:col-span-2">
				<label for="hero-subtitle" class="field-label">Ondertitel</label>
				<textarea id="hero-subtitle" name="subtitle" rows="3" maxlength="400" class="field">{s.hero.subtitle}</textarea>
			</div>
			{@render text('hero', 'ctaPrimary', 'Knop 1 (offerte)', s.hero.ctaPrimary)}
			{@render text('hero', 'ctaSecondary', 'Knop 2 (realisaties)', s.hero.ctaSecondary)}
			{@render text('hero', 'badge', 'Label op de foto', s.hero.badge, { hint: 'Leeg laten om te verbergen.' })}
			{@render text('hero', 'imageAlt', 'Beschrijving van de foto (alt-tekst)', s.hero.imageAlt)}
			<div class="sm:col-span-2"><ImageField name="image" label="Hero-foto" current={s.hero.imageUrl} /></div>
			<div class="sm:col-span-2">{@render saveBar('hero')}</div>
		</form>
	</section>

	<!-- COMPANY -->
	<section id="company" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">Bedrijf & contact</h2>
		<p class="mb-5 text-sm text-ink-500">Gebruikt in de header, het contactblok, de footer en de Google-gegevens (JSON-LD).</p>
		<form method="POST" action="?/company" use:enhance={submit('company')} class="grid gap-5 sm:grid-cols-2">
			{@render text('company', 'name', 'Merknaam', s.company.name)}
			{@render text('company', 'legalName', 'Officiële naam', s.company.legalName)}
			{@render text('company', 'tagline', 'Slogan', s.company.tagline)}
			{@render text('company', 'owner', 'Zaakvoerder', s.company.owner)}
			{@render text('company', 'phone', 'Telefoon', s.company.phone, { type: 'tel' })}
			{@render text('company', 'email', 'E-mail', s.company.email, { type: 'email' })}
			{@render text('company', 'street', 'Straat en nummer', s.company.street)}
			<div class="grid grid-cols-[7rem_1fr] gap-3">
				{@render text('company', 'postalCode', 'Postcode', s.company.postalCode)}
				{@render text('company', 'city', 'Gemeente', s.company.city)}
			</div>
			{@render text('company', 'country', 'Land', s.company.country)}
			{@render text('company', 'vat', 'BTW-nummer', s.company.vat)}
			{@render text('company', 'openingHours', 'Openingsuren / bereikbaarheid', s.company.openingHours, { full: true })}
			{@render text('company', 'serviceArea', 'Werkgebied', s.company.serviceArea, { full: true })}
			{@render text('company', 'facebook', 'Facebook', s.company.facebook, { type: 'url' })}
			{@render text('company', 'instagram', 'Instagram', s.company.instagram, { type: 'url' })}
			{@render text('company', 'linkedin', 'LinkedIn', s.company.linkedin, { type: 'url' })}
			<div class="grid grid-cols-2 gap-3">
				{@render text('company', 'latitude', 'Breedtegraad', String(s.company.latitude ?? ''))}
				{@render text('company', 'longitude', 'Lengtegraad', String(s.company.longitude ?? ''))}
			</div>
			<div class="sm:col-span-2">{@render saveBar('company')}</div>
		</form>
	</section>

	<!-- ABOUT -->
	<section id="about" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">Over ons</h2>
		<p class="mb-5 text-sm text-ink-500">Het verhaal van het bedrijf, met foto en merken.</p>
		<form method="POST" action="?/about" enctype="multipart/form-data" use:enhance={submit('about', true)} class="grid gap-5 sm:grid-cols-2">
			{@render text('about', 'title', 'Titel', s.about.title, { full: true })}
			<div class="sm:col-span-2">
				<label for="about-body" class="field-label">Tekst</label>
				<textarea id="about-body" name="body" rows="7" class="field">{s.about.body}</textarea>
				<p class="mt-1 text-xs text-ink-500">Lege regel = nieuwe alinea.</p>
			</div>
			{@render text('about', 'quote', 'Uitspraak van de zaakvoerder (optioneel)', s.about.quote, {
				full: true,
				hint: 'Eén zin in eigen woorden, bv. waarom u dit werk graag doet. Verschijnt met uw naam onder het verhaal. Leeg laten = niet tonen.'
			})}
			<div class="sm:col-span-2">
				<label for="about-highlights" class="field-label">Troeven (één per regel)</label>
				<textarea id="about-highlights" name="highlights" rows="4" class="field">{s.about.highlights.join('\n')}</textarea>
			</div>
			{@render text('about', 'partners', 'Merken (gescheiden door komma’s)', s.about.partners.join(', '), { full: true })}
			<div class="sm:col-span-2"><ImageField name="image" label="Foto" current={s.about.imageUrl} /></div>
			{@render text('about', 'imageAlt', 'Beschrijving van de foto (alt-tekst)', s.about.imageAlt, { full: true })}
			<div class="sm:col-span-2">{@render saveBar('about')}</div>
		</form>
	</section>

	<!-- TRUST -->
	<section id="trust" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">Vertrouwensbalk</h2>
		<p class="mb-5 text-sm text-ink-500">Vier troeven onder de hero. Gebruik <code class="rounded bg-ink-50 px-1">{'{projecten}'}</code> in een titel voor het aantal realisaties. Vermeld enkel wat klopt.</p>
		<form method="POST" action="?/trust" use:enhance={submit('trust')} class="space-y-4">
			{#each [0, 1, 2, 3] as i (i)}
				{@const item = s.trust[i]}
				<div class="grid gap-3 rounded-md bg-ink-50 p-4 sm:grid-cols-[1fr_1.4fr_10rem]">
					<div>
						<label for="trust-title-{i}" class="field-label">Titel {i + 1}</label>
						<input id="trust-title-{i}" name="title_{i}" value={item?.title ?? ''} maxlength="60" class="field" />
					</div>
					<div>
						<label for="trust-text-{i}" class="field-label">Tekst</label>
						<input id="trust-text-{i}" name="text_{i}" value={item?.text ?? ''} maxlength="120" class="field" />
					</div>
					<div>
						<label for="trust-icon-{i}" class="field-label">Icoon</label>
						<select id="trust-icon-{i}" name="icon_{i}" class="field">
							{#each ICON_NAMES as n (n)}<option selected={item?.icon === n}>{n}</option>{/each}
						</select>
					</div>
				</div>
			{/each}
			{@render saveBar('trust')}
		</form>
	</section>

	<!-- SEO -->
	<section id="seo" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">SEO</h2>
		<p class="mb-5 text-sm text-ink-500">Hoe de site verschijnt in Google en bij delen op sociale media.</p>
		<form method="POST" action="?/seo" use:enhance={submit('seo')} class="grid gap-5">
			{@render text('seo', 'title', 'Paginatitel', s.seo.title, { hint: 'Ideaal 50–60 tekens.', max: 90 })}
			<div>
				<label for="seo-description" class="field-label">Metabeschrijving</label>
				<textarea id="seo-description" name="description" rows="3" maxlength="300" aria-invalid={err('seo', 'description') ? 'true' : undefined} class="field">{s.seo.description}</textarea>
				{#if err('seo', 'description')}<p class="field-error">{err('seo', 'description')}</p>{:else}<p class="mt-1 text-xs text-ink-500">Ideaal 140–160 tekens.</p>{/if}
			</div>
			{@render text('seo', 'siteUrl', 'Website-adres', s.seo.siteUrl, { type: 'url', hint: 'Voor canonieke links en de sitemap, bv. https://svelectro.be' })}
			{@render text('seo', 'ogImageUrl', 'Afbeelding bij delen (URL)', s.seo.ogImageUrl, { type: 'url', hint: 'Leeg = de hero-foto.' })}
			<div class="rounded-md bg-ink-50 p-4">
				<p class="text-xs font-bold tracking-wide text-ink-500 uppercase">Voorbeeld in Google</p>
				<p class="mt-2 truncate text-sm text-ink-600">{s.seo.siteUrl.replace(/^https?:\/\//, '')}</p>
				<p class="truncate text-lg text-[#1a0dab]">{s.seo.title}</p>
				<p class="line-clamp-2 text-sm text-ink-700">{s.seo.description}</p>
			</div>
			{@render saveBar('seo')}
		</form>
	</section>

	<!-- THEME -->
	<section id="theme" class="scroll-mt-20 rounded-lg bg-white p-5 ring-1 ring-ink-100 sm:p-6">
		<h2 class="font-condensed text-2xl font-extrabold text-ink-950 uppercase">Accentkleur</h2>
		<p class="mb-5 text-sm text-ink-500">Kleur van knoppen en links. De standaard (#D42A00) is het SV Electro-rood, donker genoeg voor leesbare witte tekst.</p>
		<form method="POST" action="?/theme" use:enhance={submit('theme')} class="flex flex-wrap items-end gap-4">
			<div>
				<label for="accent" class="field-label">Kleur</label>
				<div class="flex items-center gap-2">
					<input type="color" bind:value={accent} class="h-11 w-14 cursor-pointer rounded-md border border-ink-200" aria-label="Kleur kiezen" />
					<input id="accent" name="accent" bind:value={accent} class="field !w-32 font-mono" />
				</div>
			</div>
			<span class="btn text-white" style="background:{accent}">Voorbeeldknop</span>
			<button class="btn-primary btn-sm" disabled={saving === 'theme'}>Opslaan</button>
			<button name="reset" value="1" class="btn-outline btn-sm"><Icon name="x" class="h-4 w-4" />Standaard</button>
		</form>
	</section>
</div>
