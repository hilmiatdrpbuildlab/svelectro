# SV Electro — website + CMS

Landing page and custom CMS for **SV Electro BV** (Heist-op-den-Berg), built with SvelteKit 2 (Svelte 5,
TypeScript), Tailwind CSS 4, Drizzle ORM on **Neon PostgreSQL** and **Neon Object Storage**, deployed to
**Cloudflare Workers**.

- Live (workers.dev): https://svelectro.goosebumpsevents.workers.dev
- CMS: `/admin` (session login)
- Neon project: `svelectro` (`withered-union-89112036`, aws-eu-central-1), branch `main`

## Stack and structure

```
src/
  app.css                     Tailwind theme: brand tokens (#FF3300 / #D42A00, ink, van grey), utilities
  hooks.server.ts             DB per request, /admin session guard, security headers, edge cache
  lib/
    content.ts                Shared model: categories, statuses, icon names, settings types + defaults
    i18n/                     UI strings (nl-BE); add fr/en dictionaries with the same keys
    client/image.ts           Browser-side resize + WebP encode before upload
    components/public/*       Header, Hero, TrustBar, Services (bento + dialog), Portfolio (filter +
                              lightbox), About, Testimonials, Contact (quote form), Footer, MobileBar, Seo
    components/admin/*        PageHeader, ImageField, ProjectPhotos (multi-upload/reorder/cover), Toast…
    server/
      db/schema.ts            Drizzle schema (site_settings, services, projects, project_images,
                              testimonials, inquiries, admin_users, admin_sessions, rate_limit_events)
      storage.ts              Neon Object Storage over the S3 API (@aws-sdk/client-s3)
      auth.ts, password.ts    Sessions (HMAC-hashed tokens, HttpOnly cookie) + PBKDF2 (WebCrypto)
      ratelimit.ts            Login and quote-form throttling (hashed IPs)
      media.ts, files.ts      Upload validation (magic bytes, size limits) and storage
      settings.ts             site_settings read/merge/save
  routes/
    (public)/                 Landing page (+ quote form action), /privacy
    admin/                    login, dashboard, projects, services, testimonials, inquiries, settings,
                              files/[...key] (private attachments)
    robots.txt, sitemap.xml
scripts/                      migrate.ts, seed.ts, create-admin.ts
drizzle/                      SQL migrations
```

### Media

- `media` bucket (**public_read**): site photos, served straight from
  `https://br-soft-forest-bgrup9fw.storage.c-9.eu-central-1.aws.neon.tech/media/<key>` with
  `Cache-Control: immutable` (keys are unique per upload, never overwritten).
- `private` bucket: quote-form attachments, only streamed to signed-in admins via `/admin/files/...`.
- CMS uploads are resized to max 2000 px and encoded to WebP **in the browser** (plus a 720 px thumbnail
  for project photos), then validated again on the server by magic bytes (JPG/PNG/WebP, max 12 MB).
  Deleting an image, project, service cover, inquiry or replaced hero/about photo also deletes its objects.

## Local development

```bash
npm install
cp .env.example .env          # fill in (or: npx neonctl env pull, then map the names)
cp .env .dev.vars             # for `wrangler dev`
npm run dev                   # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run db:generate` | Generate a migration after changing `schema.ts` |
| `npm run db:migrate` | Apply migrations to Neon |
| `npm run db:seed` | Import svelectro.be content and photos into Neon (idempotent; `-- --reset` to redo) |
| `npm run admin:create -- <email> <password> [name]` | Create an admin, or reset a password (signs out all sessions) |
| `npm run check` | Type-check |
| `npm run deploy` | Build and deploy to Cloudflare |

## Deploy (Cloudflare Workers)

Non-secret settings are in `wrangler.jsonc` (`vars`). Secrets are set once:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put NEON_STORAGE_ACCESS_KEY_ID
npx wrangler secret put NEON_STORAGE_SECRET_ACCESS_KEY
npx wrangler secret put AUTH_SECRET
npm run deploy
```

Public pages are cached at the edge for 60 s (Cache API in `hooks.server.ts`), so CMS changes are live
within a minute. Add `?nocache` to a URL to bypass the cache. `/admin` is never cached.

**Custom domain:** once `svelectro.be` is on Cloudflare, add it under Workers → svelectro → Settings →
Domains & Routes, and check *Instellingen → SEO → Website-adres* (`https://svelectro.be`, used for
canonical URLs and JSON-LD).

## Content notes

- All texts, services, projects and photos come from svelectro.be. Project locations are only filled in
  where the old site named them (Meerhout, Hulshout).
- **Reviews:** the old site has none. Two clearly marked *VOORBEELD* drafts are seeded **unpublished**; the
  reviews section stays hidden until a real review is published in the CMS.
- **Trust bar:** only confirmed claims, explained in plain language (AREI-conform, inspection arranged,
  one point of contact, free quote; Smappee Certified lives in the hero badge). No 24/7 service,
  years-in-business or project counts are claimed; edit them in *Instellingen → Vertrouwensbalk* if they
  apply (`{projecten}` inserts the live project count). The defaults only seed new databases.
- **Quote form:** a name, a message and an e-mail address *or* a phone number are required. Leads
  without an e-mail address are stored with an empty `email` and shown as "bel de klant terug" in the CMS.
- Opening hours default to “Maandag tot vrijdag, op afspraak”: confirm with the client.
