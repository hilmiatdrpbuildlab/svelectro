/**
 * UI strings for the public site. Dutch (nl-BE) is the only locale today; adding French or
 * English means adding a dictionary with the same keys and choosing the locale in
 * routes/(public)/+layout.server.ts (e.g. from a /fr or /en path prefix). CMS content (services,
 * projects, settings) would get per-locale columns or a translations table at that point.
 */
const nl = {
	'nav.services': 'Diensten',
	'nav.projects': 'Realisaties',
	'nav.about': 'Over ons',
	'nav.contact': 'Contact',
	'nav.cta': 'Gratis offerte',
	'nav.call': 'Bel ons',
	'nav.menu': 'Menu',
	'nav.close': 'Sluiten',
	'nav.skip': 'Naar de inhoud',

	'services.title': 'Alles voor een veilige, slimme installatie',
	'services.intro':
		'Van een enkel stopcontact tot een volledige nieuwbouw: één aanspreekpunt, vakwerk volgens het AREI (het Belgische reglement voor elektrische installaties) en een installatie die klaar is voor de toekomst.',
	'services.more': 'Meer info',
	'services.quote': 'Gratis offerte voor deze dienst',
	'services.back': 'Terug naar overzicht',

	'projects.title': 'Werk waar we achter staan',
	'projects.intro': 'Een greep uit recente projecten in de Zuiderkempen en omstreken.',
	'projects.all': 'Alle',
	'projects.photos': "foto's",
	'projects.view': 'Bekijk project',
	'projects.empty': 'Geen projecten in deze categorie.',
	'projects.filter': 'Filter op categorie',
	'projects.quote': 'Gratis offerte voor een gelijkaardig project',
	'projects.category': 'Categorie',

	'lightbox.prev': 'Vorige foto',
	'lightbox.next': 'Volgende foto',
	'lightbox.close': 'Sluiten',

	'testimonials.title': 'Wat klanten zeggen',

	'partners.title': 'Merken waarmee we werken',

	'contact.title': 'Vertel ons over uw project',
	'contact.intro':
		'Vul het formulier in en u krijgt een gratis, vrijblijvende offerte. Liever meteen iemand spreken? Bel gerust.',
	'contact.next.title': 'Zo gaat het verder',
	'contact.next.1': '{naam} bekijkt uw aanvraag en neemt zelf contact met u op.',
	'contact.next.2': 'Waar nodig volgt een plaatsbezoek om de situatie te bekijken.',
	'contact.next.3': 'U krijgt een duidelijke offerte vooraf, zonder verrassingen.',
	'contact.name': 'Naam',
	'contact.email': 'E-mail',
	'contact.phone': 'Telefoon',
	'contact.city': 'Postcode en gemeente',
	'contact.city.placeholder': 'Bv. 2220 Heist-op-den-Berg',
	'contact.reach.hint': 'Vul minstens uw e-mailadres of telefoonnummer in.',
	'contact.service': 'Type werk',
	'contact.service.choose': 'Kies een dienst',
	'contact.service.other': 'Iets anders',
	'contact.message': 'Beschrijving van het project',
	'contact.message.placeholder': 'Bv. renovatie van een rijwoning uit 1975, nieuwe verdeelkast en keuring nodig.',
	'contact.file': "Foto of plan toevoegen (optioneel)",
	'contact.file.choose': 'Kies een bestand',
	'contact.file.hint': 'JPG, PNG, WebP of PDF, max. 10 MB',
	'contact.file.tip': 'Een foto van uw verdeelkast of een plan helpt om sneller een juiste prijs te geven.',
	'contact.file.tip.charger': 'Bv. een foto van uw verdeelkast en van de plek waar de laadpaal moet komen.',
	'contact.file.tip.inspection': 'Bv. uw keuringsverslag en een foto van de verdeelkast.',
	'contact.file.tip.renovation': "Bv. foto's van de verdeelkast en van de ruimtes die u wilt vernieuwen.",
	'contact.file.tip.newbuild': 'Bv. het bouwplan of grondplan van de woning.',
	'contact.file.tip.solar': 'Bv. een foto van uw verdeelkast en van de omvormer, als u die al heeft.',
	'contact.privacy': 'Uw gegevens gebruiken we alleen om uw aanvraag te beantwoorden.',
	'contact.submit': 'Verstuur aanvraag',
	'contact.sending': 'Bezig met versturen…',
	'contact.success.title': 'Bedankt, uw aanvraag is goed ontvangen.',
	'contact.success.titleNamed': 'Bedankt, {klant}. Uw aanvraag is goed ontvangen.',
	'contact.success.text': '{naam} bekijkt uw aanvraag en neemt zelf contact met u op.',
	'contact.success.urgent': 'Is het dringend? Bel',
	'contact.again': 'Nog een aanvraag versturen',
	'contact.required.legend': 'Velden met een sterretje zijn verplicht.',
	'contact.err.name': 'Vul uw naam in.',
	'contact.err.email': 'Vul een geldig e-mailadres in, bv. naam@voorbeeld.be.',
	'contact.err.phone': 'Vul een geldig telefoonnummer in, bv. 0470 12 34 56.',
	'contact.err.reach': 'Vul een e-mailadres of telefoonnummer in, zodat we u kunnen bereiken.',
	'contact.err.message': 'Beschrijf uw project in een paar woorden (min. 10 tekens).',
	'contact.err.fileSize': 'De bijlage is te groot (max. 10 MB). Kies een kleinere foto of mail ze ons.',
	'contact.err.summary': 'Nog niet verstuurd: controleer de gemarkeerde velden.',
	'contact.err.rateLimit': 'U verstuurde net meerdere aanvragen. Probeer het binnen enkele minuten opnieuw of bel ons.',
	'contact.err.server': 'Uw aanvraag kon niet worden verstuurd. Uw gegevens staan nog in het formulier: probeer het opnieuw, of bel ons op',

	'footer.company': 'Bedrijfsgegevens',
	'footer.links': 'Snel naar',
	'footer.hours': 'Openingsuren',
	'footer.privacy': 'Privacybeleid',
	'footer.rights': 'Alle rechten voorbehouden.',

	'mobile.call': 'Bellen',
	'mobile.quote': 'Gratis offerte'
} as const;

export type MessageKey = keyof typeof nl;
const dictionaries = { nl } satisfies Record<string, Record<MessageKey, string>>;
export type Locale = keyof typeof dictionaries;
export const DEFAULT_LOCALE: Locale = 'nl';

export function translator(locale: Locale = DEFAULT_LOCALE) {
	const dict = dictionaries[locale] ?? dictionaries.nl;
	return (key: MessageKey) => dict[key] ?? key;
}

export const t = translator();

/** Fills `{name}` placeholders in a message, e.g. fmt(t('contact.next.1'), { naam: 'Sooi' }). */
export function fmt(message: string, vars: Record<string, string>) {
	return message.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
