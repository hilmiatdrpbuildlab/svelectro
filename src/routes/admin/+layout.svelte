<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';

	let { data, children } = $props();
	let navOpen = $state(false);

	const nav = $derived([
		{ href: '/admin', label: 'Dashboard', icon: 'layout-grid' },
		{ href: '/admin/inquiries', label: 'Aanvragen', icon: 'inbox', badge: data.unread },
		{ href: '/admin/projects', label: 'Realisaties', icon: 'briefcase' },
		{ href: '/admin/services', label: 'Diensten', icon: 'wrench' },
		{ href: '/admin/testimonials', label: 'Reviews', icon: 'quote' },
		{ href: '/admin/settings', label: 'Instellingen', icon: 'settings' }
	]);
	const isActive = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);

	$effect(() => {
		page.url.pathname;
		navOpen = false;
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<title>Beheer | SV Electro</title>
</svelte:head>

{#if !data.user}
	{@render children()}
{:else}
	<div class="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[16rem_1fr]">
		<aside
			class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-950 text-ink-200 transition-transform duration-300 ease-(--ease-snap) lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 {navOpen
				? 'translate-x-0'
				: '-translate-x-full'}"
		>
			<div class="flex h-16 items-center px-5">
				<a href="/admin" aria-label="Dashboard"><Logo tone="light" /></a>
			</div>
			<nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Beheer">
				<ul class="space-y-1">
					{#each nav as item (item.href)}
						<li>
							<a
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								class="flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] font-semibold transition {isActive(item.href)
									? 'bg-white/10 text-white'
									: 'hover:bg-white/5 hover:text-white'}"
							>
								<Icon name={item.icon} class="h-5 w-5 {isActive(item.href) ? 'text-brand-500' : 'text-ink-400'}" />
								<span class="flex-1">{item.label}</span>
								{#if item.badge}
									<span class="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white tabular-nums">{item.badge}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<div class="border-t border-white/10 p-3">
				<a href="/" target="_blank" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-white/5 hover:text-white">
					<Icon name="external" class="h-4 w-4 text-ink-400" /> Bekijk website
				</a>
				<div class="mt-2 flex items-center justify-between gap-2 rounded-md bg-white/5 px-3 py-2.5">
					<div class="min-w-0 text-sm">
						<p class="truncate font-semibold text-white">{data.user.name}</p>
						<p class="truncate text-xs text-ink-400">{data.user.email}</p>
					</div>
					<form method="POST" action="/admin/logout">
						<button class="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 hover:text-white" title="Afmelden">
							<Icon name="logout" class="h-4 w-4" /><span class="sr-only">Afmelden</span>
						</button>
					</form>
				</div>
			</div>
		</aside>

		{#if navOpen}
			<button class="fixed inset-0 z-30 bg-ink-950/60 lg:hidden" aria-label="Menu sluiten" onclick={() => (navOpen = false)}></button>
		{/if}

		<div class="min-w-0">
			<header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
				<button
					class="inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-ink-200"
					onclick={() => (navOpen = true)}
					aria-label="Menu openen"
				>
					<Icon name="menu" class="h-5 w-5" />
				</button>
				<Logo compact />
				<span class="font-bold text-ink-900">Beheer</span>
			</header>
			<main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
				{@render children()}
			</main>
		</div>
	</div>
	<Toast />
{/if}
