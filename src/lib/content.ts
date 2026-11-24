/** Content model shared by the public site, the CMS and the seed script. */

export const PROJECT_CATEGORIES = [
	'Renovatie',
	'Nieuwbouw',
	'Conformiteit',
	'Domotica',
	'Verlichting',
	'Laadpalen',
	'Zonne-energie & batterijen',
	'Videofonie'
] as const;

export const CLIENT_TYPES = ['Particulier', 'Bedrijf', 'Bouwpromotor', 'Overheid'] as const;

export const INQUIRY_STATUSES = [
	{ value: 'new', label: 'Nieuw', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
	{ value: 'contacted', label: 'Gecontacteerd', tone: 'bg-sky-50 text-sky-800 ring-sky-200' },
	{ value: 'quoted', label: 'Offerte verstuurd', tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
	{ value: 'archived', label: 'Afgerond', tone: 'bg-slate-100 text-slate-700 ring-slate-200' }
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['value'];
export const statusMeta = (s: string) => INQUIRY_STATUSES.find((x) => x.value === s) ?? INQUIRY_STATUSES[0];

/** Icon names available for services (rendered by components/Icon.svelte). */
export const ICON_NAMES = [
	'bolt',
	'home-renovation',
	'building',
	'shield-check',
	'smart-home',
	'bulb',
	'ev-charger',
	'solar',
	'battery',
	'intercom',
	'factory',
	'plug'
] as const;
export type IconName = (typeof ICON_NAMES)[number];

export interface CompanySettings {
	name: string;
	legalName: string;
	tagline: string;
	owner: string;
	phone: string;
	email: string;
	street: string;
	postalCode: string;
	city: string;
	country: string;
	vat: string;
	openingHours: string;
	serviceArea: string;
	facebook: string;
	instagram: string;
	linkedin: string;
	latitude: number | null;
	longitude: number | null;
}

export interface HeroSettings {
	eyebrow: string;
	title: string;
	titleAccent: string;
	subtitle: string;
	imageUrl: string;
	imageKey: string;
	imageAlt: string;
	ctaPrimary: string;
	ctaSecondary: string;
	badge: string;
}

export interface SeoSettings {
	title: string;
	description: string;
	ogImageUrl: string;
	siteUrl: string;
}

export interface AboutSettings {
	/** No longer shown on the site (eyebrows were removed); kept so stored rows stay valid. */
	eyebrow: string;
	title: string;
	body: string;
	/** Optional first-person line from the owner, shown under the story. Leave empty until the owner writes one. */
	quote: string;
	imageUrl: string;
	imageKey: string;
	imageAlt: string;
	highlights: string[];
	partners: string[];
}

export interface TrustItem {
	title: string;
	text: string;
	icon: IconName;
}

export interface ThemeSettings {
	/** Overrides --color-brand-600 (buttons, links). Must keep 4.5:1 against white. */
	accent: string;
}

export interface SiteSettings {
	company: CompanySettings;
	hero: HeroSettings;
	seo: SeoSettings;
	about: AboutSettings;
	trust: TrustItem[];
	theme: ThemeSettings;
}

export const DEFAULT_SETTINGS: SiteSettings = {
	company: {
		name: 'SV Electro',
		legalName: 'SV Electro BV',
		tagline: 'Kwaliteit in elektriciteit',
		owner: 'Sooi Valgaeren',
		phone: '+32 483 49 62 45',
		email: 'info@svelectro.be',
		street: 'Zonnedauwlei 8A',
		postalCode: '2220',
		city: 'Heist-op-den-Berg',
		country: 'België',
		vat: 'BE 0713.659.880',
		openingHours: 'Maandag tot vrijdag, op afspraak',
		serviceArea: 'Heist-op-den-Berg, de Zuiderkempen en ruime omgeving',
		facebook: 'https://www.facebook.com/profile.php?id=100045993806135',
		instagram: '',
		linkedin: '',
		latitude: 51.088473,
		longitude: 4.783968
	},
	hero: {
		eyebrow: 'Erkend elektricien · Heist-op-den-Berg',
		title: 'Kwaliteit in',
		titleAccent: 'elektriciteit.',
		subtitle:
			'Renovatie, nieuwbouw, laadpalen, domotica en thuisbatterijen. SV Electro plaatst veilige installaties volgens het AREI, het Belgische reglement, en regelt alles van het schema van uw installatie tot de keuring.',
		imageUrl: '',
		imageKey: '',
		imageAlt: 'Technische ruimte met nieuwe verdeelkast, geplaatst door SV Electro',
		ctaPrimary: 'Gratis offerte aanvragen',
		ctaSecondary: 'Bekijk onze realisaties',
		badge: 'Smappee Certified installateur'
	},
	seo: {
		title: 'SV Electro | Elektricien in Heist-op-den-Berg & Zuiderkempen',
		description:
			'SV Electro BV: algemene elektriciteitswerken, renovatie, nieuwbouw, AREI-conformiteit, domotica, verlichting, laadpalen, zonnepanelen en thuisbatterijen. Vraag een gratis offerte aan.',
		ogImageUrl: '',
		siteUrl: 'https://svelectro.be'
	},
	about: {
		eyebrow: 'Over SV Electro',
		title: 'Eén vakman, van eerste nazicht tot keuring.',
		body:
			'SV Electro wordt gerund door zaakvoerder Sooi Valgaeren. Vanuit Heist-op-den-Berg, in de Zuiderkempen, werken we voor particulieren en bedrijven.\n\nU spreekt van begin tot eind met dezelfde persoon: wie uw installatie inspecteert, plaatst ze ook en organiseert de keuring. Zo weet u precies wat er gebeurt en waarom.',
		imageUrl: '',
		imageKey: '',
		imageAlt: 'De bestelwagens van SV Electro',
		quote: '',
		highlights: [
			'Installaties volgens het AREI, inclusief eendraadschema en situatieschema',
			'Keuring georganiseerd door een erkend keuringsorganisme',
			'Smappee Certified installateur voor laadpalen en energiebeheer',
			'Heldere offerte vooraf, zonder verrassingen'
		],
		partners: ['Smappee', 'Enphase', 'Huawei', 'Alfen']
	},
	trust: [
		{ title: 'AREI-conform', text: 'Volgens het Belgische reglement voor elektrische installaties', icon: 'shield-check' },
		{ title: 'Keuring geregeld', text: 'Wij plannen de keuring bij een erkend keuringsorganisme', icon: 'bolt' },
		{ title: 'Eén aanspreekpunt', text: 'Van offerte tot keuring spreekt u met de zaakvoerder zelf', icon: 'home-renovation' },
		{ title: 'Gratis offerte', text: 'Vrijblijvend, met een duidelijke prijs vooraf', icon: 'plug' }
	],
	theme: { accent: '' }
};

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[];

export const slugify = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80) || 'item';

export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '');
