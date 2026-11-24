<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { telHref, type CompanySettings } from '$lib/content';
	import { t } from '$lib/i18n';

	let { company, services }: { company: CompanySettings; services: { title: string; slug: string }[] } = $props();
	const year = new Date().getFullYear();
	const socials = $derived(
		[
			{ name: 'facebook', href: company.facebook, label: 'Facebook' },
			{ name: 'instagram', href: company.instagram, label: 'Instagram' },
			{ name: 'linkedin', href: company.linkedin, label: 'LinkedIn' }
		].filter((s) => s.href)
	);
</script>

<footer class="bg-ink-950 pb-24 text-ink-300 lg:pb-0">
	<div class="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
		<div>
			<Logo tone="light" />
			<p class="mt-5 max-w-xs text-[0.95rem] leading-relaxed">
				Elektriciteitswerken voor woningen en bedrijven in {company.serviceArea}.
			</p>
			{#if socials.length}
				<ul class="mt-6 flex gap-2">
					{#each socials as s (s.name)}
						<li>
							<a
								href={s.href}
								rel="noopener"
								target="_blank"
								class="inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
							>
								<Icon name={s.name} class="h-4 w-4" label={s.label} />
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div>
			<h2 class="eyebrow text-white">{t('footer.company')}</h2>
			<address class="mt-4 space-y-2 text-[0.95rem] not-italic">
				<p class="font-semibold text-white">{company.legalName}</p>
				<p>{company.street}<br />{company.postalCode} {company.city}</p>
				<p><a class="hover:text-white" href={telHref(company.phone)}>{company.phone}</a></p>
				<p><a class="hover:text-white" href="mailto:{company.email}">{company.email}</a></p>
				<p>BTW {company.vat}</p>
			</address>
		</div>

		<div>
			<h2 class="eyebrow text-white">{t('nav.services')}</h2>
			<ul class="mt-4 space-y-2 text-[0.95rem]">
				{#each services.slice(0, 8) as s (s.slug)}
					<li><a class="hover:text-white" href="#dienst-{s.slug}">{s.title}</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h2 class="eyebrow text-white">{t('footer.links')}</h2>
			<ul class="mt-4 space-y-2 text-[0.95rem]">
				<li><a class="hover:text-white" href="#realisaties">{t('nav.projects')}</a></li>
				<li><a class="hover:text-white" href="#over-ons">{t('nav.about')}</a></li>
				<li><a class="hover:text-white" href="#offerte">{t('nav.cta')}</a></li>
			</ul>
			<h2 class="eyebrow mt-8 text-white">{t('footer.hours')}</h2>
			<p class="mt-3 text-[0.95rem]">{company.openingHours}</p>
		</div>
	</div>
	<div class="border-t border-white/10">
		<div class="container-x flex flex-col gap-2 py-6 text-sm text-ink-400 sm:flex-row sm:justify-between">
			<p>© {year} {company.legalName}. {t('footer.rights')}</p>
			<p><a class="hover:text-white" href="/privacy">{t('footer.privacy')}</a></p>
		</div>
	</div>
</footer>
