/**
 * npm run db:seed [-- --reset]
 *
 * Migrates the existing content of https://svelectro.be into Neon:
 *  - downloads the original project photos, converts them to WebP (full size + thumbnail) and
 *    uploads them to the public `media` bucket on Neon Object Storage;
 *  - fills site_settings, services, projects, project_images and (unpublished) testimonials;
 *  - creates the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * Idempotent: content tables are only filled when empty. `--reset` wipes them (and their
 * bucket objects) first.
 */
import 'dotenv/config';
import sharp from 'sharp';
import { sql } from 'drizzle-orm';
import { createDb } from '../src/lib/server/db/index';
import { adminUsers, projectImages, projects, services, siteSettings, testimonials } from '../src/lib/server/db/schema';
import { createStorage, newKey } from '../src/lib/server/storage';
import { hashPassword } from '../src/lib/server/password';
import { DEFAULT_SETTINGS, type IconName } from '../src/lib/content';

const env = (k: string) => {
	const v = process.env[k];
	if (!v) throw new Error(`${k} is not set`);
	return v;
};

const db = createDb(env('DATABASE_URL'));
const storage = createStorage({
	endpoint: env('NEON_STORAGE_ENDPOINT').replace(/\/+$/, ''),
	region: process.env.NEON_STORAGE_REGION || 'eu-central-1',
	accessKeyId: env('NEON_STORAGE_ACCESS_KEY_ID'),
	secretAccessKey: env('NEON_STORAGE_SECRET_ACCESS_KEY'),
	bucket: process.env.NEON_STORAGE_BUCKET || 'media',
	privateBucket: process.env.NEON_STORAGE_PRIVATE_BUCKET || 'private'
});

const SRC = 'https://svelectro.be/cms-data';
const gallery = (n: string) => `${SRC}/gallery/svElectroSiteRealisatiesGallerij/${n}.jpg`;
const blog = (slug: string) => `${SRC}/blog/svElectroBlog/${slug}/image/${slug}.jpg`;
const section = (n: number) => `${SRC}/image/svElectroSiteDeel${n}Foto.jpg`;

interface Uploaded {
	url: string;
	key: string;
	thumbUrl: string;
	thumbKey: string;
	width: number;
	height: number;
}

const cache = new Map<string, Promise<Uploaded>>();

/** Download → auto-rotate → WebP 2000px + 720px thumb → Neon bucket. */
function migrateImage(src: string, folder: string): Promise<Uploaded> {
	const id = `${folder}|${src}`;
	const hit = cache.get(id);
	if (hit) return hit;
	const job = (async () => {
		const res = await fetch(src);
		if (!res.ok) throw new Error(`Download failed (${res.status}): ${src}`);
		const input = Buffer.from(await res.arrayBuffer());
		const base = sharp(input).rotate();
		const full = await base
			.clone()
			.resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 76 })
			.toBuffer({ resolveWithObject: true });
		const thumb = await base
			.clone()
			.resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 74 })
			.toBuffer();
		const key = newKey(folder, 'webp');
		const thumbKey = key.replace(/\.webp$/, '-thumb.webp');
		await storage.put('public', key, full.data, 'image/webp');
		await storage.put('public', thumbKey, thumb, 'image/webp');
		console.log(`  ↑ ${src.split('/').pop()} → ${key} (${Math.round(full.data.length / 1024)} KB)`);
		return {
			url: storage.publicUrl(key),
			key,
			thumbUrl: storage.publicUrl(thumbKey),
			thumbKey,
			width: full.info.width,
			height: full.info.height
		};
	})();
	cache.set(id, job);
	return job;
}

// ---------------------------------------------------------------------------------------------
// Content from svelectro.be (texts lightly edited for the web; facts unchanged).

const SERVICES: {
	title: string;
	slug: string;
	icon: IconName;
	image: string;
	short: string;
	full: string;
}[] = [
	{
		title: 'Renovatie',
		slug: 'renovatie',
		icon: 'home-renovation',
		image: gallery('na-renovatie'),
		short: 'Verouderde of onveilige installatie? We inspecteren, vernieuwen en brengen alles weer conform.',
		full: 'Laat een gekwalificeerde elektricien uw bestaande installatie inspecteren. Zo weet u welke bedrading, schakelaars of stopcontacten verouderd zijn of niet meer veilig functioneren.\n\nWe controleren of de installatie voldoet aan de huidige veiligheidsnormen en of de capaciteit volstaat voor moderne toestellen en technologieën, zoals een laadpaal, warmtepomp of inductiekookplaat. Daarna vernieuwen we wat nodig is, netjes en met zo weinig breekwerk als mogelijk.'
	},
	{
		title: 'Nieuwbouw',
		slug: 'nieuwbouw',
		icon: 'building',
		image: section(3),
		short: 'Elektriciteit op maat voor uw nieuwbouwproject, van ontwerp en eendraadschema tot keuring.',
		full: 'SV Electro verzorgt de volledige elektrische installatie van uw nieuwbouwwoning of bedrijfspand. Vanaf het ontwerp tot de plaatsing van moderne, efficiënte systemen staan we klaar om uw project van stroom en licht te voorzien.\n\nWe maken het eendraadschema en het situatieschema op, trekken de leidingen, plaatsen de verdeelkast en organiseren de keuring, zodat u zonder zorgen kunt aansluiten.'
	},
	{
		title: 'Algemene conformiteit (AREI)',
		slug: 'conformiteit',
		icon: 'shield-check',
		image: gallery('img-2905'),
		short: 'Geen geldig keuringsverslag of een afgekeurde installatie? Wij maken ze 100% veilig en conform.',
		full: 'Beschikt u niet over een geldig keuringsbewijs, of is uw installatie niet conform met het AREI (Algemeen Reglement op de Elektrische Installaties)? SV Electro kijkt na wat er moet gebeuren en voert de nodige aanpassingen uit.\n\nZo beschikt u over een 100% veilige en conforme installatie, bijvoorbeeld bij de verkoop van uw woning of na een negatief keuringsverslag.'
	},
	{
		title: 'Domotica & Smart Home',
		slug: 'domotica',
		icon: 'smart-home',
		image: gallery('img-1734'),
		short: 'Slimme woningen en bedrijven: comfort, energie-efficiëntie en beveiliging in één systeem.',
		full: 'Ontdek wat domotica op maat voor u kan doen. We creëren slimme woningen en bedrijven met technologie die comfort, efficiëntie en beveiliging combineert: verlichting, rolluiken, verwarming en energiebeheer, centraal en eenvoudig te bedienen.\n\nLaat SV Electro uw dagelijks leven vereenvoudigen met een automatiseringssysteem dat bij u past, nu en als uw noden veranderen.'
	},
	{
		title: 'Verlichting',
		slug: 'verlichting',
		icon: 'bulb',
		image: section(6),
		short: 'Stijlvolle, energiezuinige verlichting voor woningen en bedrijven, van ontwerp tot onderhoud.',
		full: 'Verlicht uw wereld met SV Electro. We bieden expertise in verlichting, van lichtplan en ontwerp tot installatie en onderhoud.\n\nOf het nu gaat om inbouwspots in een traphal, een kroonluchter in een vide of efficiënte LED-verlichting in een bedrijfsruimte: we transformeren uw ruimtes met stijlvolle, energiezuinige oplossingen.'
	},
	{
		title: 'Laadpalen',
		slug: 'laadpalen',
		icon: 'ev-charger',
		image: gallery('img-7251'),
		short: 'Smappee Certified installateur. Laadpaal aan gevel of op oprit, inclusief aanpassing van uw verdeelkast.',
		full: 'Als Smappee Certified installateur plaatsen we laadpalen voor thuis en voor bedrijven, met slim laden en energiebeheer. We werken ook met andere merken, zoals Alfen.\n\nWe bekijken vooraf of uw installatie en aansluiting volstaan, breiden de verdeelkast uit waar nodig en zorgen voor een conforme, gekeurde installatie.'
	},
	{
		title: 'Zonnepanelen & thuisbatterijen',
		slug: 'zonnepanelen-thuisbatterijen',
		icon: 'battery',
		image: gallery('img-6961'),
		short: 'Sla uw eigen zonne-energie op en gebruik ze wanneer u ze nodig heeft, ook in de winter.',
		full: 'Waarom uw kostbare zonne-energie weggeven en daar straks nog voor betalen? Met een slimme thuisbatterij slaat u uw eigen stroom op en gebruikt u ze wanneer u ze nodig hebt. Zo bespaart u dubbel: minder injectie én minder afhankelijkheid van dure stroomtarieven.\n\nWe plaatsen omvormers, thuisbatterijen (onder meer Enphase en Huawei) en zonnepanelen, en zorgen voor de keuring.'
	},
	{
		title: 'Videofonie',
		slug: 'videofonie',
		icon: 'intercom',
		image: gallery('videofoon'),
		short: 'Zie wie er aanbelt: videofoons en toegangscontrole aan poort of voordeur.',
		full: 'Een videofoon geeft u comfort en veiligheid: u ziet wie er aanbelt en opent de poort of deur op afstand. We plaatsen videofonie en toegangscontrole, ook in combinatie met uw domotica of smartphone.'
	}
];

const PROJECTS: {
	title: string;
	slug: string;
	category: string;
	location?: string;
	clientType?: string;
	summary: string;
	description: string;
	featured?: boolean;
	images: { src: string; caption: string }[];
}[] = [
	{
		title: 'Laadpaal Alfen te Meerhout',
		slug: 'laadpaal-alfen-meerhout',
		category: 'Laadpalen',
		location: 'Meerhout',
		clientType: 'Particulier',
		summary: 'Laadpaal aan de buitengevel, met uitbreiding van het schakelbord.',
		description:
			'Plaatsing van een Alfen-laadpaal aan de buitengevel van een woning in Meerhout. Om de laadpaal veilig te voeden, werd het bestaande schakelbord uitgebreid.\n\nUitgevoerde werken:\n- Laadpaal aan buitengevel\n- Uitbreiding schakelbord',
		featured: true,
		images: [{ src: gallery('img-7251'), caption: 'Alfen-laadpaal aan de buitengevel' }]
	},
	{
		title: 'Nieuwbouw te Hulshout',
		slug: 'nieuwbouw-hulshout',
		category: 'Nieuwbouw',
		location: 'Hulshout',
		clientType: 'Particulier',
		summary: 'Volledige elektrische installatie voor een nieuwbouwwoning, met eendraadschema en keuring.',
		description:
			'Volledige elektrische installatie voor een nieuwbouwwoning in Hulshout, van leidingwerk tot afgewerkte technische ruimte.\n\nUitgevoerde werken:\n- Elektrische installatie voor nieuwbouw\n- Eendraadschema\n- Organisatie van de keuring',
		featured: true,
		images: [{ src: gallery('img-7431'), caption: 'Technische ruimte met verdeelkasten' }]
	},
	{
		title: 'Thuisbatterij met hybride omvormer',
		slug: 'thuisbatterij-hybride-omvormer',
		category: 'Zonne-energie & batterijen',
		clientType: 'Particulier',
		summary: 'Huawei-thuisbatterij en omvormer: zelf opgewekte zonne-energie opslaan en later gebruiken.',
		description:
			'Plaatsing van een Huawei-thuisbatterij met hybride omvormer bij een woning met zonnepanelen. De batterij slaat overtollige zonne-energie op, zodat die ’s avonds en op bewolkte dagen gebruikt kan worden in plaats van ze op het net te injecteren.',
		featured: true,
		images: [
			{ src: gallery('img-6961'), caption: 'Omvormer en thuisbatterij in de technische ruimte' },
			{ src: section(2), caption: 'Detail van de thuisbatterij' }
		]
	},
	{
		title: 'Kroonluchter in vide',
		slug: 'kroonluchter-vide',
		category: 'Verlichting',
		clientType: 'Particulier',
		summary: 'Ophangen en aansluiten van een grote kroonluchter in een hoge vide.',
		description:
			'Een grote kroonluchter ophangen in een vide van twee verdiepingen vraagt om de juiste voorbereiding. Met een rolsteiger werd de armatuur veilig opgehangen en aangesloten.',
		featured: true,
		images: [
			{ src: section(6), caption: 'Kroonluchter in de vide, geplaatst vanaf een rolsteiger' },
			{ src: gallery('img-0533'), caption: 'Het eindresultaat' }
		]
	},
	{
		title: 'Inbouwverlichting traphal',
		slug: 'inbouwverlichting-traphal',
		category: 'Verlichting',
		clientType: 'Particulier',
		summary: 'Inbouwspots die de traphal sfeervol en veilig verlichten.',
		description: 'Plaatsing van inbouwspots in de traphal van een woning, voor veilig en sfeervol licht op elke trede.',
		images: [{ src: gallery('img-1702'), caption: 'Inbouwspots in de traphal' }]
	},
	{
		title: 'Domotica-verdeelkast',
		slug: 'domotica-verdeelkast',
		category: 'Domotica',
		clientType: 'Particulier',
		summary: 'Bekabeling en modules van een domotica-installatie, centraal in de verdeelkast.',
		description:
			'Bekabeling en aansluiting van een domotica-installatie. Alle sturingen voor verlichting en verbruikers komen samen in één overzichtelijke verdeelkast.',
		images: [{ src: gallery('img-1734'), caption: 'Domotica-modules tijdens de aansluiting' }]
	},
	{
		title: 'Nieuwe verdeelkasten',
		slug: 'nieuwe-verdeelkasten',
		category: 'Conformiteit',
		summary: 'Overzichtelijke, gelabelde verdeelkasten volgens het AREI.',
		description:
			'Een conforme installatie begint bij een goede verdeelkast: correct gedimensioneerd, met de juiste beveiligingen en duidelijk gelabeld zodat elke kring terug te vinden is.',
		images: [
			{ src: gallery('img-2905'), caption: 'Gelabelde verdeelkast' },
			{ src: gallery('img-5805'), caption: 'Verdeelkast met schema in de deur' },
			{ src: gallery('img-7704'), caption: 'Verdeelkast tijdens de afwerking' }
		]
	},
	{
		title: 'Renovatie elektrische installatie',
		slug: 'renovatie-elektrische-installatie',
		category: 'Renovatie',
		clientType: 'Particulier',
		summary: 'Een verouderde installatie volledig vernieuwd, van bekabeling tot verdeelkast.',
		description:
			'Bij deze renovatie werd de verouderde installatie volledig vernieuwd: nieuwe bekabeling, een nieuwe verdeelkast en een conforme aansluiting.',
		images: [
			{ src: gallery('img-6972'), caption: 'Tijdens de werken: nieuwe bekabeling' },
			{ src: gallery('na-renovatie'), caption: 'Na de renovatie' }
		]
	},
	{
		title: 'Leidingwerk nieuwbouw',
		slug: 'leidingwerk-nieuwbouw',
		category: 'Nieuwbouw',
		summary: 'Ruwbouwfase: leidingen en wachtbuizen voor de volledige woning.',
		description:
			'In de ruwbouwfase worden alle leidingen en wachtbuizen gelegd, nog voor de chape gegoten wordt. Een goede voorbereiding hier bespaart later breekwerk.',
		images: [{ src: section(3), caption: 'Leidingwerk in de ruwbouw' }]
	},
	{
		title: 'Videofoon aan toegangspoort',
		slug: 'videofoon-toegangspoort',
		category: 'Videofonie',
		clientType: 'Particulier',
		summary: 'Videofoon geïntegreerd in een zuil aan de toegangspoort.',
		description: 'Plaatsing van een videofoon in een strakke zuil aan de oprit, zodat bezoekers aan de poort zichtbaar zijn.',
		images: [{ src: gallery('videofoon'), caption: 'Videofoon in zuil aan de poort' }]
	}
];

// Clearly-marked drafts so the CMS has something to edit. They stay unpublished (and the
// homepage hides the reviews section) until real client reviews replace them.
const TESTIMONIAL_DRAFTS = [
	{
		clientName: 'VOORBEELD – vervang door echte klant',
		companyOrCity: 'Heist-op-den-Berg',
		rating: 5,
		quote: 'Voorbeeldtekst. Vervang deze review door een echte klantbeoordeling voordat u ze publiceert.'
	},
	{
		clientName: 'VOORBEELD – vervang door echte klant',
		companyOrCity: 'Meerhout',
		rating: 5,
		quote: 'Voorbeeldtekst. Plak hier een echte review (bijvoorbeeld uit Google of Facebook) en koppel ze aan het juiste project.'
	}
];

// ---------------------------------------------------------------------------------------------

async function isEmpty(table: typeof services | typeof projects | typeof testimonials | typeof siteSettings) {
	const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
	return row.n === 0;
}

async function reset() {
	console.log('Resetting content tables and their bucket objects…');
	const imgs = await db.select({ a: projectImages.storageKey, b: projectImages.thumbKey }).from(projectImages);
	const svc = await db.select({ a: services.coverImageKey }).from(services);
	const settings = await db.select().from(siteSettings);
	const settingKeys = settings.flatMap((s) => {
		const v = s.value as { imageKey?: string };
		return v?.imageKey ? [v.imageKey, v.imageKey.replace(/\.webp$/, '-thumb.webp')] : [];
	});
	await storage.delete('public', ...imgs.flatMap((r) => [r.a, r.b]), ...svc.map((r) => r.a), ...settingKeys);
	await db.batch([db.delete(testimonials), db.delete(projectImages), db.delete(projects), db.delete(services), db.delete(siteSettings)]);
}

async function main() {
	if (process.argv.includes('--reset')) await reset();

	if (await isEmpty(siteSettings)) {
		console.log('Settings…');
		const hero = await migrateImage(gallery('img-7431'), 'site');
		const about = await migrateImage(gallery('img-7735'), 'site');
		const s = structuredClone(DEFAULT_SETTINGS);
		s.hero.imageUrl = hero.url;
		s.hero.imageKey = hero.key;
		s.about.imageUrl = about.url;
		s.about.imageKey = about.key;
		await db.insert(siteSettings).values(Object.entries(s).map(([key, value]) => ({ key, value })));
	} else console.log('Settings: already present, skipped.');

	if (await isEmpty(services)) {
		console.log('Services…');
		let order = 0;
		for (const sv of SERVICES) {
			const img = await migrateImage(sv.image, 'services');
			await db.insert(services).values({
				title: sv.title,
				slug: sv.slug,
				shortDescription: sv.short,
				fullDescription: sv.full,
				iconName: sv.icon,
				coverImageUrl: img.url,
				coverImageKey: img.key,
				sortOrder: order++,
				isActive: true
			});
		}
	} else console.log('Services: already present, skipped.');

	if (await isEmpty(projects)) {
		console.log('Projects…');
		let order = 0;
		for (const p of PROJECTS) {
			const [row] = await db
				.insert(projects)
				.values({
					title: p.title,
					slug: p.slug,
					category: p.category,
					location: p.location ?? null,
					clientType: p.clientType ?? null,
					summary: p.summary,
					description: p.description,
					featured: !!p.featured,
					sortOrder: order++
				})
				.returning({ id: projects.id });
			let i = 0;
			for (const im of p.images) {
				const up = await migrateImage(im.src, 'projects');
				await db.insert(projectImages).values({
					projectId: row.id,
					imageUrl: up.url,
					storageKey: up.key,
					thumbUrl: up.thumbUrl,
					thumbKey: up.thumbKey,
					width: up.width,
					height: up.height,
					caption: im.caption,
					isCover: i === 0,
					sortOrder: i
				});
				i++;
			}
		}
	} else console.log('Projects: already present, skipped.');

	if (await isEmpty(testimonials)) {
		console.log('Testimonial drafts (unpublished)…');
		await db.insert(testimonials).values(TESTIMONIAL_DRAFTS.map((t) => ({ ...t, isPublished: false })));
	}

	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;
	if (email && password) {
		const existing = await db.select().from(adminUsers).where(sql`lower(${adminUsers.email}) = lower(${email})`);
		if (existing.length === 0) {
			await db.insert(adminUsers).values({
				email,
				name: process.env.ADMIN_NAME || 'Beheerder',
				passwordHash: await hashPassword(password)
			});
			console.log(`Admin user created: ${email}`);
		} else console.log(`Admin user ${email} already exists, password unchanged.`);
	} else console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set: no admin user created (use npm run admin:create).');

	console.log('Seed complete.');
}

await main();
