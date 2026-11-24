<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { telHref } from '$lib/content';
	import { t } from '$lib/i18n';

	let { phone }: { phone: string } = $props();
	let pastHero = $state(false);
	let atForm = $state(false);
	const visible = $derived(pastHero && !atForm);

	// Appears once the hero buttons have scrolled away, and steps aside while the quote form
	// itself is on screen, so there is never a second set of the same two buttons in view.
	$effect(() => {
		const heroCta = document.getElementById('hero-cta');
		const form = document.getElementById('offerte');
		const io = new IntersectionObserver((entries) => {
			for (const e of entries) {
				if (e.target === heroCta) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
				if (e.target === form) atForm = e.isIntersecting;
			}
		});
		if (heroCta) io.observe(heroCta);
		else pastHero = true;
		if (form) io.observe(form);
		return () => io.disconnect();
	});
</script>

<div
	class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-(--ease-snap) lg:hidden {visible
		? 'translate-y-0'
		: 'translate-y-full'}"
	aria-hidden={!visible}
	inert={!visible}
>
	<div class="grid grid-cols-2 gap-3">
		<a href={telHref(phone)} class="btn-ghost-light">
			<Icon name="phone" class="h-4 w-4 text-brand-500" />
			{t('mobile.call')}
		</a>
		<a href="#offerte" class="btn-primary">
			{t('mobile.quote')}
			<Icon name="arrow-right" class="h-4 w-4" />
		</a>
	</div>
</div>
