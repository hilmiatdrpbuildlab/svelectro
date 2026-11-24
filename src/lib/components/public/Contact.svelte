<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { telHref, type CompanySettings } from '$lib/content';
	import { fmt, t } from '$lib/i18n';
	import { matchService, quoteState } from '$lib/state/quote.svelte';

	type Field = 'fullName' | 'email' | 'phone' | 'city' | 'serviceType' | 'message' | 'attachment' | 'form';
	type TextField = 'fullName' | 'email' | 'phone' | 'city' | 'message';
	interface FormResult {
		success?: boolean;
		attachmentFailed?: boolean;
		firstName?: string;
		values?: Partial<Record<Field, string>>;
		errors?: Partial<Record<Field, string>>;
	}

	let {
		company,
		serviceTitles,
		form
	}: { company: CompanySettings; serviceTitles: string[]; form: FormResult | null | undefined } = $props();

	const owner = $derived(company.owner.trim().split(/\s+/)[0] || company.name);

	let pending = $state(false);
	let done = $state(false);
	let serverError = $state(false);
	let fileName = $state('');
	let fileError = $state('');
	let attempted = $state(false);
	let touched = $state<Partial<Record<TextField, boolean>>>({});
	const fromValues = (v: FormResult['values']): Record<TextField, string> => ({
		fullName: v?.fullName ?? '',
		email: v?.email ?? '',
		phone: v?.phone ?? '',
		city: v?.city ?? '',
		message: v?.message ?? ''
	});
	// Seeded from the server echo so a no-JS failed submit still renders what was typed.
	// svelte-ignore state_referenced_locally
	let fields = $state(fromValues(form?.values));

	const serverErrors = $derived(form?.errors ?? {});
	$effect(() => {
		if (form?.success) done = true;
	});
	// After a failed submit the server echoes what was sent; keep the fields in sync with it.
	$effect(() => {
		if (form?.values) fields = fromValues(form.values);
	});

	// A service card or project may pre-select the type of work.
	let serviceType = $state('');
	$effect(() => {
		if (quoteState.serviceType) serviceType = matchService(quoteState.serviceType, serviceTitles);
	});
	$effect(() => {
		if (form?.values?.serviceType) serviceType = form.values.serviceType;
	});

	/** Mirrors the server rules in +page.server.ts so problems show before the round trip. */
	const clientErrors = $derived.by(() => {
		const e: Partial<Record<TextField, string>> = {};
		const email = fields.email.trim();
		const phone = fields.phone.trim();
		if (fields.fullName.trim().length < 2) e.fullName = t('contact.err.name');
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('contact.err.email');
		else if (!email && !phone) e.email = t('contact.err.reach');
		if (phone && !/^[+0-9 ()./-]{8,}$/.test(phone)) e.phone = t('contact.err.phone');
		if (fields.message.trim().length < 10) e.message = t('contact.err.message');
		return e;
	});

	/** Client rules win once a field was visited (or a submit was attempted); otherwise show what the server said. */
	function err(k: TextField) {
		return attempted || touched[k] ? clientErrors[k] : serverErrors[k];
	}
	const reachError = $derived(err('email') === t('contact.err.reach'));
	const fileErr = $derived(fileError || serverErrors.attachment || '');
	const formError = $derived(
		serverErrors.form ?? (attempted && Object.keys(clientErrors).length ? t('contact.err.summary') : '')
	);

	const blur = (k: TextField) => () => (touched[k] = true);

	const MAX = 10 * 1024 * 1024;
	function onFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const f = input.files?.[0];
		fileError = '';
		fileName = f?.name ?? '';
		if (f && f.size > MAX) {
			fileError = t('contact.err.fileSize');
			input.value = '';
			fileName = '';
		}
	}

	const uploadTip = $derived.by(() => {
		const s = serviceType.toLowerCase();
		if (s.includes('laadp')) return t('contact.file.tip.charger');
		if (s.includes('conform') || s.includes('keur')) return t('contact.file.tip.inspection');
		if (s.includes('renov')) return t('contact.file.tip.renovation');
		if (s.includes('nieuwb')) return t('contact.file.tip.newbuild');
		if (s.includes('zonne') || s.includes('batter')) return t('contact.file.tip.solar');
		return t('contact.file.tip');
	});

	const contactRows = $derived([
		{ icon: 'phone', label: 'Telefoon', value: company.phone, href: telHref(company.phone) },
		{ icon: 'mail', label: 'E-mail', value: company.email, href: `mailto:${company.email}` },
		{
			icon: 'map-pin',
			label: 'Adres',
			value: `${company.street}, ${company.postalCode} ${company.city}`,
			href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.legalName} ${company.street} ${company.postalCode} ${company.city}`)}`
		},
		{ icon: 'clock', label: 'Bereikbaar', value: company.openingHours, href: '' }
	]);

	const steps = $derived([
		fmt(t('contact.next.1'), { naam: owner }),
		t('contact.next.2'),
		t('contact.next.3')
	]);

	function startOver() {
		done = false;
		attempted = false;
		touched = {};
		fields = fromValues(undefined);
		serviceType = '';
	}
</script>

<section id="contact" class="bg-white py-20 sm:py-28" aria-labelledby="contact-titel">
	<div class="container-x grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-x-16 lg:gap-y-12">
		<div class="lg:col-start-1 lg:row-start-1">
			<h2 id="contact-titel" class="display text-[clamp(2.4rem,5.5vw,4rem)] text-balance text-ink-950">{t('contact.title')}</h2>
			<p class="mt-5 max-w-md text-lg leading-relaxed text-ink-600">{t('contact.intro')}</p>

			<div class="mt-8 max-w-md">
				<h3 class="font-condensed text-lg font-extrabold text-ink-950 uppercase">{t('contact.next.title')}</h3>
				<ol class="mt-4 space-y-3">
					{#each steps as step, i (i)}
						<li class="flex gap-3">
							<span
								class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink-950 text-sm font-bold text-brand-500 tabular-nums"
								aria-hidden="true">{i + 1}</span
							>
							<span class="pt-0.5 leading-snug text-ink-700">{step}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>

		<div
			id="offerte"
			class="rounded-lg bg-ink-50 p-6 ring-1 ring-ink-100 sm:p-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
		>
			{#if done}
				<div class="flex min-h-[28rem] flex-col items-start justify-center" role="status">
					<span class="inline-flex h-14 w-14 items-center justify-center rounded-md bg-brand-600 text-white">
						<Icon name="check" class="h-7 w-7" stroke={2.5} />
					</span>
					<h3 class="display mt-6 text-3xl text-balance text-ink-950">
						{form?.firstName ? fmt(t('contact.success.titleNamed'), { klant: form.firstName }) : t('contact.success.title')}
					</h3>
					<p class="mt-3 text-lg text-ink-600">{fmt(t('contact.success.text'), { naam: owner })}</p>
					<p class="mt-2 text-ink-600">
						{t('contact.success.urgent')}
						<a href={telHref(company.phone)} class="font-bold text-ink-950 tabular-nums underline underline-offset-4">{company.phone}</a>
					</p>
					{#if form?.attachmentFailed}
						<p class="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
							Uw bijlage kon niet worden opgeslagen. Wilt u ze mailen naar
							<a class="font-semibold underline" href="mailto:{company.email}">{company.email}</a>?
						</p>
					{/if}
					<button type="button" class="btn-outline mt-8" onclick={startOver}>{t('contact.again')}</button>
				</div>
			{:else}
				<form
					method="POST"
					action="?/quote"
					enctype="multipart/form-data"
					novalidate
					aria-describedby="offerte-verplicht"
					use:enhance={({ cancel, formElement }) => {
						attempted = true;
						serverError = false;
						if (Object.keys(clientErrors).length) {
							cancel();
							tick().then(() => formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
							return;
						}
						pending = true;
						return async ({ result, update }) => {
							pending = false;
							if (result.type === 'error') {
								// Keep everything the visitor typed; show the fallback instead of an error page.
								serverError = true;
								return;
							}
							await update({ reset: false, invalidateAll: false });
							if (result.type === 'success') {
								fileName = '';
								formElement.reset();
								fields = { fullName: '', email: '', phone: '', city: '', message: '' };
								attempted = false;
								touched = {};
								document.getElementById('offerte')?.scrollIntoView({ block: 'start' });
							} else if (result.type === 'failure') {
								// Show what the server rejected; client rules take over again on the next blur.
								attempted = false;
								touched = {};
								await tick();
								formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
							}
						};
					}}
					class="grid gap-5 sm:grid-cols-2"
				>
					<p id="offerte-verplicht" class="text-sm text-ink-600 sm:col-span-2">
						<span class="font-bold text-brand-600">*</span> {t('contact.required.legend')}
					</p>

					<!-- Honeypot -->
					<div class="absolute -left-[9999px]" aria-hidden="true">
						<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
					</div>

					<div class="sm:col-span-2">
						<label for="fullName" class="field-label">{t('contact.name')} <span class="text-brand-600">*</span></label>
						<input
							id="fullName"
							name="fullName"
							autocomplete="name"
							required
							maxlength="120"
							bind:value={fields.fullName}
							onblur={blur('fullName')}
							aria-invalid={err('fullName') ? 'true' : undefined}
							aria-describedby={err('fullName') ? 'fullName-err' : undefined}
							class="field"
						/>
						{#if err('fullName')}<p id="fullName-err" class="field-error">{err('fullName')}</p>{/if}
					</div>
					<div>
						<label for="email" class="field-label">{t('contact.email')}</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							maxlength="200"
							bind:value={fields.email}
							onblur={blur('email')}
							aria-invalid={err('email') ? 'true' : undefined}
							aria-describedby={err('email') ? 'email-err' : 'reach-hint'}
							class="field"
						/>
						{#if err('email')}<p id="email-err" class="field-error">{err('email')}</p>{/if}
					</div>
					<div>
						<label for="phone" class="field-label">{t('contact.phone')}</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							autocomplete="tel"
							inputmode="tel"
							maxlength="40"
							bind:value={fields.phone}
							onblur={blur('phone')}
							aria-invalid={err('phone') || reachError ? 'true' : undefined}
							aria-describedby={err('phone') ? 'phone-err' : reachError ? 'email-err' : 'reach-hint'}
							class="field"
						/>
						{#if err('phone')}<p id="phone-err" class="field-error">{err('phone')}</p>{/if}
					</div>
					{#if !err('email') && !err('phone')}
						<p id="reach-hint" class="-mt-3 text-sm text-ink-500 sm:col-span-2">{t('contact.reach.hint')}</p>
					{/if}
					<div>
						<label for="city" class="field-label">{t('contact.city')}</label>
						<input
							id="city"
							name="city"
							autocomplete="address-level2"
							maxlength="120"
							placeholder={t('contact.city.placeholder')}
							bind:value={fields.city}
							class="field"
						/>
					</div>
					<div>
						<label for="serviceType" class="field-label">{t('contact.service')}</label>
						<select id="serviceType" name="serviceType" bind:value={serviceType} class="field">
							<option value="">{t('contact.service.choose')}</option>
							{#each serviceTitles as s (s)}<option value={s}>{s}</option>{/each}
							<option value="Iets anders">{t('contact.service.other')}</option>
						</select>
					</div>
					<div class="sm:col-span-2">
						<label for="message" class="field-label">{t('contact.message')} <span class="text-brand-600">*</span></label>
						<textarea
							id="message"
							name="message"
							rows="5"
							required
							maxlength="5000"
							placeholder={t('contact.message.placeholder')}
							bind:value={fields.message}
							onblur={blur('message')}
							aria-invalid={err('message') ? 'true' : undefined}
							aria-describedby={err('message') ? 'message-err' : undefined}
							class="field resize-y"
						></textarea>
						{#if err('message')}<p id="message-err" class="field-error">{err('message')}</p>{/if}
					</div>
					<div class="sm:col-span-2">
						<span id="attachment-label" class="field-label">{t('contact.file')}</span>
						<label
							for="attachment"
							class="flex cursor-pointer items-center gap-4 rounded-md border-2 border-dashed bg-white px-4 py-4 transition hover:border-brand-500 focus-within:border-brand-500 {fileErr
								? 'border-brand-600'
								: 'border-ink-200'}"
						>
							<span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink-50 text-ink-700">
								<Icon name={fileName ? 'paperclip' : 'upload'} class="h-5 w-5" />
							</span>
							<span class="min-w-0 text-sm">
								<span class="block truncate font-semibold text-ink-900">{fileName || t('contact.file.choose')}</span>
								<span id="attachment-hint" class="block text-ink-600">{uploadTip}</span>
								<span class="block text-ink-500">{t('contact.file.hint')}</span>
							</span>
							<input
								id="attachment"
								name="attachment"
								type="file"
								accept="image/jpeg,image/png,image/webp,application/pdf"
								onchange={onFile}
								aria-labelledby="attachment-label"
								aria-invalid={fileErr ? 'true' : undefined}
								aria-describedby={fileErr ? 'attachment-err' : 'attachment-hint'}
								class="sr-only"
							/>
						</label>
						{#if fileErr}<p id="attachment-err" class="field-error">{fileErr}</p>{/if}
					</div>

					{#if formError}
						<p class="rounded-md bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 ring-1 ring-brand-200 sm:col-span-2" role="alert">
							{formError}
						</p>
					{/if}
					{#if serverError}
						<p class="rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-200 sm:col-span-2" role="alert">
							{t('contact.err.server')}
							<a class="font-semibold underline" href={telHref(company.phone)}>{company.phone}</a>.
						</p>
					{/if}
					<div class="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
						<p class="text-sm text-ink-500">
							{t('contact.privacy')} <a href="/privacy" class="underline underline-offset-2 hover:text-ink-800">{t('footer.privacy')}</a>
						</p>
						<button type="submit" class="btn-primary shrink-0" disabled={pending}>
							{#if pending}
								<span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
								{t('contact.sending')}
							{:else}
								{t('contact.submit')}
								<Icon name="arrow-right" class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>

		<div class="lg:col-start-1 lg:row-start-2">
			<ul class="divide-y divide-ink-100 border-y border-ink-100">
				{#each contactRows as row (row.label)}
					<li class="flex items-start gap-4 py-4">
						<span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink-950 text-brand-500">
							<Icon name={row.icon} class="h-4.5 w-4.5" />
						</span>
						<div class="min-w-0">
							<p class="text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">{row.label}</p>
							{#if row.href}
								<a
									href={row.href}
									target={row.href.startsWith('http') ? '_blank' : undefined}
									rel={row.href.startsWith('http') ? 'noopener' : undefined}
									class="font-semibold break-words text-ink-950 underline-offset-4 hover:text-brand-600 hover:underline"
								>
									{row.value}
								</a>
							{:else}
								<p class="font-semibold text-ink-950">{row.value}</p>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-sm text-ink-500">{company.legalName} · BTW {company.vat}</p>
		</div>
	</div>
</section>
