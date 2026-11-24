/** Lets a service card or project pre-select the type of work in the quote form. */
export const quoteState = $state({ serviceType: '' });

const norm = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();

/**
 * Finds the service that best matches a hint, e.g. a project category ("Conformiteit")
 * for a service title ("Algemene conformiteit (AREI)"). Returns '' when nothing matches.
 */
export function matchService(hint: string, titles: string[]): string {
	if (!hint) return '';
	const exact = titles.find((t) => norm(t) === norm(hint));
	if (exact) return exact;
	const stem = norm(hint).split(/[^a-z0-9]+/).find((w) => w.length >= 4);
	if (!stem) return '';
	const key = stem.slice(0, 5);
	return titles.find((t) => norm(t).includes(key)) ?? '';
}

export function requestQuoteFor(service: string) {
	quoteState.serviceType = service;
	const el = document.getElementById('offerte');
	el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	// Move focus to the first field once the scroll has started, for keyboard users.
	setTimeout(() => (document.getElementById('fullName') as HTMLInputElement | null)?.focus({ preventScroll: true }), 400);
}
