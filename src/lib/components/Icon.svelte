<script lang="ts" module>
	/** Stroke icons on a 24×24 grid (Lucide-style, drawn inline so nothing loads from a CDN). */
	const PATHS: Record<string, string> = {
		bolt: 'M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z',
		'home-renovation': 'M3 10.5 12 3l9 7.5M5 9v11h14V9M10 20v-5h4v5M15.5 3.5l2 2',
		building: 'M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4',
		'shield-check': 'M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10ZM8.5 12l2.5 2.5 4.5-5',
		'smart-home': 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5ZM9 14.5a4.2 4.2 0 0 1 6 0M10.8 16.8a1.7 1.7 0 0 1 2.4 0',
		bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z',
		'ev-charger': 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M2 21h14M14 10h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V8l-3-3M9.5 7 7.5 10.5h3l-2 3.5',
		solar: 'M3 20h18M5 16l1.5-8h11l1.5 8H5ZM6 12h12M10 8l-.5 8M14 8l.5 8M12 2v2M5.5 4.5 7 6M18.5 4.5 17 6',
		battery: 'M7 4h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM10 2h4M12.5 8l-2.5 4h4l-2.5 4',
		intercom: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM9 6h6v5H9zM9 15h.01M12 15h.01M15 15h.01M9 18h.01M12 18h.01M15 18h.01',
		factory: 'M2 20V9l6 3.5V9l6 3.5V5h6v15H2ZM2 20h20M7 16h2M12 16h2M17 16h2',
		plug: 'M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7ZM12 17v5',
		phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z',
		mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 6l-10 7L2 6',
		'map-pin': 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
		clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
		receipt: 'M4 2v20l3-2 2 2 3-2 3 2 2-2 3 2V2l-3 2-2-2-3 2-3-2-2 2-3-2ZM8 8h8M8 12h8M8 16h5',
		'arrow-right': 'M5 12h14M13 5l7 7-7 7',
		'arrow-up-right': 'M7 17 17 7M8 7h9v9',
		check: 'M20 6 9 17l-5-5',
		x: 'M18 6 6 18M6 6l12 12',
		'chevron-left': 'm15 18-6-6 6-6',
		'chevron-right': 'm9 18 6-6-6-6',
		'chevron-up': 'm18 15-6-6-6 6',
		'chevron-down': 'm6 9 6 6 6-6',
		menu: 'M4 6h16M4 12h16M4 18h16',
		star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z',
		upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
		paperclip: 'm21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5',
		trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
		grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
		eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
		'eye-off': 'M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6A17.3 17.3 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M14.1 14.1a3 3 0 1 1-4.2-4.2',
		image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5L5 21',
		'layout-grid': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
		briefcase: 'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20',
		wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z',
		quote: 'M3 21c3 0 7-1 7-8V5c0-1.3-.8-2-2-2H4c-1.3 0-2 .7-2 2v6c0 1.3.7 2 2 2h3c0 3-1 5-4 5v3ZM15 21c3 0 7-1 7-8V5c0-1.3-.8-2-2-2h-4c-1.3 0-2 .7-2 2v6c0 1.3.7 2 2 2h3c0 3-1 5-4 5v3Z',
		inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z',
		settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
		logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
		plus: 'M12 5v14M5 12h14',
		pencil: 'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z',
		external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
		file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6',
		facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z',
		instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM16 11.4A4 4 0 1 1 12.6 8a4 4 0 0 1 3.4 3.4ZM17.5 6.5h.01',
		linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'
	};
	export const hasIcon = (name: string) => name in PATHS;
</script>

<script lang="ts">
	let {
		name,
		class: klass = 'h-5 w-5',
		stroke = 2,
		filled = false,
		label
	}: { name: string; class?: string; stroke?: number; filled?: boolean; label?: string } = $props();
	const d = $derived(PATHS[name] ?? PATHS.bolt);
</script>

<svg
	viewBox="0 0 24 24"
	class={klass}
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path {d} />
</svg>
