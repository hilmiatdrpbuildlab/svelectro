# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: homeowners in Heist-op-den-Berg and the Zuiderkempen.** They are renovating, building new, or adding a modern energy upgrade (EV charger, solar, home battery, domotics). They need to find an electrician they can trust, see that the work is careful and compliant, and request a quote with as little effort as possible. Many will arrive on a phone.

**Secondary:** businesses, property developers (bouwpromotoren) and public clients (overheid). They are served by the same site and are listed as client types in the project data. They are not the audience the landing page optimises for.

**CMS user: the owner, Sooi Valgaeren.** Sooi updates projects, services and settings and works through incoming quote requests themselves, often on a phone between jobs. The admin area has to work one-handed, on a small screen and with short attention spans.

## Product Purpose

SV Electro BV's website (svelectro.be) does two jobs:

- **The public landing page** turns local visitors into quote requests (the "Gratis offerte" form with an optional photo or file attachment) or phone calls.
- **The custom CMS at `/admin`** lets the owner keep the portfolio, services, reviews and company details current without a developer, and manage leads through the statuses Nieuw → Gecontacteerd → Offerte verstuurd → Afgerond.

Success means more qualified quote requests from homeowners in the area, and a CMS the owner actually keeps up to date.

## Positioning

These points are confirmed by the user:

- **The owner does the work.** SV Electro is a small, owner-run business. Sooi is both the person on site and the point of contact.
- **End-to-end, through to the keuring.** SV Electro handles everything from the single-line diagram (eendraadschema) to arranging the inspection. The customer doesn't have to chase anyone.
- **Smappee Certified installer.** This matters for EV charging, energy monitoring and battery jobs.
- **Local and responsive.** Based in Heist-op-den-Berg, working in a short radius, quick to reply to quote requests.

## Operating Context

- **Market and language:** Belgium (Flanders). All UI and content is in Dutch (nl-BE). Strings live in `src/lib/i18n/` so other languages can be added. French and English are possible but not planned.
- **Rules and terms:** Belgian electrical work is governed by the AREI/RGIE. Conformity inspection (keuring) and the single-line diagram (eendraadschema) are terms customers recognise.
- **Services:** renovation, new build, conformity/inspections, domotics, lighting, EV chargers, solar and home batteries, and video intercoms (videofonie). Project categories in `src/lib/content.ts` follow this list.
- **Lead flow:** quote form → `inquiries` table plus a private attachment → the owner follows up by phone or email → the status is updated in the CMS.

## Capabilities and Constraints

- SvelteKit 2 (Svelte 5, TypeScript), Tailwind CSS 4, Drizzle on Neon PostgreSQL, Neon Object Storage, deployed to Cloudflare Workers. See README.md.
- Public pages are cached at the edge for 60 s, so CMS changes go live within a minute.
- CMS image uploads are resized and encoded to WebP in the browser, then validated again on the server. Quote attachments stay private and only signed-in admins can open them.
- The theme accent can be overridden in the CMS settings, but it must keep at least 4.5:1 contrast against white.
- **Open decisions:**
  - Opening hours default to "Maandag tot vrijdag, op afspraak". This still has to be confirmed with the client.
  - A 24/7 call-out service, years in business and project counts are **not** confirmed. Don't claim them.
  - The custom domain (svelectro.be on Cloudflare) is still pending. The live site currently runs on workers.dev.

## Brand Commitments

- **Name and identity:** "SV Electro" (legal name SV Electro BV). Tagline: "Kwaliteit in elektriciteit". The logo mark is in `static/logo-mark.svg`.
- **Colours:** the original brief asked to keep the brand palette of the existing svelectro.be site. It is implemented as tokens in `src/app.css`: brand red-orange #FF3300 / #D42A00, ink, and van grey.
- **Voice:** direct, plain Dutch from a trusted local craftsman. Factual about safety and compliance, no hype.

## Evidence on Hand

- **Real content:** services, project photos and texts were imported from the old svelectro.be by `npm run db:seed`. Project locations are only filled in where the old site named them (Meerhout, Hulshout).
- **Real claims:** AREI-conform work, inspection arranged, Smappee Certified, free quote. Confirmed by the user on 2026-11-24: "Erkend elektricien" is accurate, and SV Electro works with Enphase, Huawei and Alfen (the brand strip in About).
- **Not confirmed:** "brede ervaring" or any other experience or years-in-business claim, and response times.
- **Company facts:** Zonnedauwlei 8A, 2220 Heist-op-den-Berg. VAT number BE 0713.659.880. Phone and email are in the CMS settings.
- **Reviews:** there are no real reviews yet. The two seeded reviews are unpublished drafts marked *VOORBEELD* ("example"). The reviews section stays hidden until a real one is published. Never invent reviews, ratings, customer names, partner brands, years in business or project counts.

## Product Principles

1. **Earn the call, not the click.** Every public section should move a local homeowner closer to a quote request or a phone call.
2. **Show the work.** Real project photos and specific scope beat generic claims. Trust is shown, not asserted.
3. **Compliance in plain language.** AREI, keuring and eendraadschema are reassurances. Explain them simply. Don't use them as jargon.
4. **Only true claims.** Every badge, metric and review must be real and confirmed. If a claim isn't confirmed, leave it out.
5. **A CMS for someone between jobs.** Admin tasks must be quick on a phone, hard to get wrong, and leads must never be missed.

## Accessibility & Inclusion

Target WCAG 2.2 AA, as the original brief requires. Contrast must hold in particular for brand-coloured buttons and links, and for any accent colour set in the CMS. Both the public site and the CMS must be fully usable on small touch screens.
