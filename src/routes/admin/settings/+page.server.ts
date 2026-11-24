import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { ICON_NAMES, type SiteSettings } from '$lib/content';
import { storeImage } from '$lib/server/media';
import { getSettings, saveSetting } from '$lib/server/settings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ settings: await getSettings(locals.db) });

const str = (max = 300) => z.string().trim().max(max);
const url = z
	.string()
	.trim()
	.max(300)
	.refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'Gebruik een volledige link (https://…).');

const lines = (f: FormData, k: string) =>
	String(f.get(k) ?? '')
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

function fieldErrors(e: z.ZodError) {
	return Object.fromEntries(e.issues.map((i) => [i.path.join('.'), i.message]));
}

/** Upload a replacement image for a settings group; returns the old key to delete afterwards. */
async function replaceImage(locals: App.Locals, form: FormData, current: { imageUrl: string; imageKey: string }) {
	const res = await storeImage(locals.storage(), form.get('image'), null, 'site');
	if (!res) return { ok: true as const, url: current.imageUrl, key: current.imageKey, old: null };
	if (!res.ok) return { ok: false as const, error: res.error };
	return { ok: true as const, url: res.image.url, key: res.image.key, old: current.imageKey || null };
}

export const actions: Actions = {
	hero: async ({ request, locals }) => {
		const form = await request.formData();
		const s = await getSettings(locals.db);
		const parsed = z
			.object({
				eyebrow: str(80),
				title: str(60).min(2, 'Verplicht.'),
				titleAccent: str(60),
				subtitle: str(400),
				imageAlt: str(200),
				ctaPrimary: str(40).min(2, 'Verplicht.'),
				ctaSecondary: str(40),
				badge: str(60)
			})
			.safeParse(Object.fromEntries(form));
		if (!parsed.success) return fail(400, { section: 'hero', error: 'Controleer de velden.', errors: fieldErrors(parsed.error) });
		const img = await replaceImage(locals, form, s.hero);
		if (!img.ok) return fail(400, { section: 'hero', error: img.error });
		await saveSetting(locals.db, 'hero', { ...s.hero, ...parsed.data, imageUrl: img.url, imageKey: img.key });
		if (img.old) await locals.storage().delete('public', img.old);
		return { section: 'hero', message: 'Hero opgeslagen.' };
	},

	company: async ({ request, locals }) => {
		const form = await request.formData();
		const s = await getSettings(locals.db);
		const num = z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().min(-180).max(180).nullable());
		const parsed = z
			.object({
				name: str(80).min(2, 'Verplicht.'),
				legalName: str(120).min(2, 'Verplicht.'),
				tagline: str(120),
				owner: str(120),
				phone: str(40).min(6, 'Verplicht.'),
				email: z.string().trim().email('Ongeldig e-mailadres.'),
				street: str(160),
				postalCode: str(12),
				city: str(80),
				country: str(60),
				vat: str(40),
				openingHours: str(200),
				serviceArea: str(200),
				facebook: url,
				instagram: url,
				linkedin: url,
				latitude: num,
				longitude: num
			})
			.safeParse(Object.fromEntries(form));
		if (!parsed.success) return fail(400, { section: 'company', error: 'Controleer de velden.', errors: fieldErrors(parsed.error) });
		await saveSetting(locals.db, 'company', { ...s.company, ...parsed.data });
		return { section: 'company', message: 'Bedrijfsgegevens opgeslagen.' };
	},

	about: async ({ request, locals }) => {
		const form = await request.formData();
		const s = await getSettings(locals.db);
		const parsed = z
			.object({ title: str(160).min(2, 'Verplicht.'), body: str(4000), quote: str(300), imageAlt: str(200) })
			.safeParse(Object.fromEntries(form));
		if (!parsed.success) return fail(400, { section: 'about', error: 'Controleer de velden.', errors: fieldErrors(parsed.error) });
		const img = await replaceImage(locals, form, s.about);
		if (!img.ok) return fail(400, { section: 'about', error: img.error });
		await saveSetting(locals.db, 'about', {
			...s.about,
			...parsed.data,
			highlights: lines(form, 'highlights').slice(0, 8),
			partners: String(form.get('partners') ?? '')
				.split(',')
				.map((p) => p.trim())
				.filter(Boolean)
				.slice(0, 12),
			imageUrl: img.url,
			imageKey: img.key
		});
		if (img.old) await locals.storage().delete('public', img.old);
		return { section: 'about', message: 'Over ons opgeslagen.' };
	},

	trust: async ({ request, locals }) => {
		const form = await request.formData();
		const items: SiteSettings['trust'] = [];
		for (let i = 0; i < 4; i++) {
			const title = String(form.get(`title_${i}`) ?? '').trim().slice(0, 60);
			const text = String(form.get(`text_${i}`) ?? '').trim().slice(0, 120);
			const icon = String(form.get(`icon_${i}`) ?? 'bolt');
			if (title) items.push({ title, text, icon: (ICON_NAMES as readonly string[]).includes(icon) ? (icon as never) : 'bolt' });
		}
		await saveSetting(locals.db, 'trust', items);
		return { section: 'trust', message: 'Vertrouwensbalk opgeslagen.' };
	},

	seo: async ({ request, locals }) => {
		const form = await request.formData();
		const s = await getSettings(locals.db);
		const parsed = z
			.object({
				title: str(90).min(10, 'Minstens 10 tekens.'),
				description: str(300).min(50, 'Minstens 50 tekens.'),
				siteUrl: url.refine((v) => v !== '', 'Verplicht.'),
				ogImageUrl: url
			})
			.safeParse(Object.fromEntries(form));
		if (!parsed.success) return fail(400, { section: 'seo', error: 'Controleer de velden.', errors: fieldErrors(parsed.error) });
		await saveSetting(locals.db, 'seo', { ...s.seo, ...parsed.data, siteUrl: parsed.data.siteUrl.replace(/\/+$/, '') });
		return { section: 'seo', message: 'SEO opgeslagen.' };
	},

	theme: async ({ request, locals }) => {
		const form = await request.formData();
		const accent = String(form.get('accent') ?? '').trim();
		if (form.get('reset') === '1') {
			await saveSetting(locals.db, 'theme', { accent: '' });
			return { section: 'theme', message: 'Standaardkleur hersteld.' };
		}
		if (!/^#[0-9a-f]{6}$/i.test(accent)) return fail(400, { section: 'theme', error: 'Gebruik een hex-kleur zoals #D42A00.' });
		if (contrastWithWhite(accent) < 4.5)
			return fail(400, {
				section: 'theme',
				error: `Te licht: witte tekst op deze kleur haalt ${contrastWithWhite(accent).toFixed(1)}:1, minimaal 4,5:1 nodig (WCAG AA).`
			});
		await saveSetting(locals.db, 'theme', { accent });
		return { section: 'theme', message: 'Accentkleur opgeslagen.' };
	}
};

function contrastWithWhite(hex: string) {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return 1.05 / (L + 0.05);
}
