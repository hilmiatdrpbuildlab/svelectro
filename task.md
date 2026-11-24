# Role & Objective
Act as a Senior Fullstack Web Developer and UI/UX Designer. Build a modern, high-converting, and responsive landing page along with a custom Content Management System (CMS) for **SV Electro** (`https://svelectro.be`), a Belgian electrical engineering and installation company.

The tech stack must strictly use **SvelteKit (Svelte 5 / TypeScript)**, **Tailwind CSS**, **Neon PostgreSQL** (via Drizzle ORM or Prisma), and **Neon Object Storage** (S3-compatible API) for media/image management.

---

# 1. Brand Identity, Color Palette & Design Principles
Inspect and preserve the existing brand identity and color palette from `https://svelectro.be`:
- **Color Palette:** Maintain the existing primary, secondary, accent, and neutral colors (e.g., deep industrial dark/navy/charcoal tones paired with energetic electrical yellow/amber/orange or crisp corporate blue accents—extract the exact hex codes from `svelectro.be` and define them as CSS variables / Tailwind theme tokens). Ensure high contrast ratios (WCAG AA compliant) for readability.
- **UI/UX Design Principles:**
  - **Visual Hierarchy:** Clear typographic scale (strong bold headings for industrial reliability, clean sans-serif body text), clear F-pattern / Z-pattern scanning flow, and prominent Call-to-Actions (CTAs) like *"Offerte aanvragen"* (Request a Quote) and *"Onze realisaties"* (Our Projects).
  - **Whitespace & Layout:** Generous padding, structured grid systems (Bento grids for services, clean masonry/card grids for portfolio), and zero visual clutter.
  - **Trust & Social Proof:** Highlight Belgian certifications (AREI/RGIE compliance), years of experience, client testimonials, and partner brands.
  - **Micro-interactions & Performance:** Smooth scroll, subtle hover states, fast image lazy-loading, and responsive mobile-first navigation (including sticky quick-call/quote button on mobile).
  - **Localization:** Primary language in **Dutch (NL-BE)** matching the Belgian market, with clean architecture ready for multi-language expansion (FR/EN) if needed.

---

# 2. Landing Page Structure & Content
Use the real project photos, services, and company details from `https://svelectro.be` to populate the initial seed data:
1. **Navbar:** Logo, navigation links (Diensten, Realisaties, Over ons, Contact), quick phone link, and primary CTA button ("Gratis offerte").
2. **Hero Section:** High-impact headline emphasizing reliable electrical installations in Belgium (residential, commercial, industrial, domotics/home automation, EV chargers, solar/battery systems), subheadline, dual CTAs, and a featured high-resolution project photo.
3. **Trust Bar / Key Metrics:** AREI-conforme keuring, 24/7 storingsdienst, certified partners, completed projects count.
4. **Services Section (Diensten):** Interactive cards/grid covering SV Electro's core services (e.g., Algemene elektriciteitswerken, Domotica & Smart Home, Laadpalen, Verlichting, Zonnepanelen & Thuisbatterijen, Industriële elektriciteit) with descriptions, icons, and modal/drawer details.
5. **Project Portfolio / Realisaties:** Filterable gallery (by category: Residentieel, Industrieel, Verlichting, Laadpalen, etc.) showcasing the actual project photos from `svelectro.be` with lightbox view, project location, scope of work, and before/after or detail shots.
6. **About Us / Over SV Electro:** Company story, craftsmanship guarantee, safety standards, and team/workmanship photo.
7. **Testimonials / Klantbeoordelingen:** Authentic client reviews with star ratings and project tags.
8. **Contact & Quote Request Form:** Interactive form (Name, Email, Phone, Postal Code/City, Service Type, Project Description, File/Photo upload option) with validation, server-side submission, and instant confirmation feedback.
9. **Footer:** Company details (BTW/VAT number, address, phone, email), quick links, opening hours, and privacy policy links.

---

# 3. Database Schema (Neon PostgreSQL) & Media Storage (Neon Object Storage)
Design a clean, normalized PostgreSQL schema hosted on **Neon**:
- `site_settings`: Key-value or structured JSON/columns for company info, contact details, hero text, SEO metadata, and color/theme overrides.
- `services`: `id`, `title`, `slug`, `short_description`, `full_description`, `icon_name`, `cover_image_url`, `sort_order`, `is_active`, `created_at`.
- `projects`: `id`, `title`, `slug`, `category`, `location`, `client_type`, `summary`, `description`, `completion_date`, `featured`, `sort_order`, `created_at`.
- `project_images`: `id`, `project_id` (FK), `image_url`, `storage_key`, `caption`, `is_cover`, `sort_order`.
- `testimonials`: `id`, `client_name`, `company_or_city`, `rating`, `quote`, `project_id` (nullable FK), `is_published`, `created_at`.
- `inquiries`: `id`, `full_name`, `email`, `phone`, `city`, `service_type`, `message`, `attachment_url`, `status` (`new`, `contacted`, `quoted`, `archived`), `created_at`.
- `admin_users`: `id`, `email`, `password_hash`, `name`, `created_at`.

**Neon Object Storage Integration:**
- Implement a dedicated server-side storage utility (`src/lib/server/storage.ts`) using `@aws-sdk/client-s3` configured for Neon Object Storage endpoints.
- Support direct file uploads from the CMS with automatic image optimization/validation (WebP/JPEG/PNG, max size limits), unique key generation, and clean deletion when records/images are removed from the CMS.
- Create a seed script (`npm run db:seed`) that downloads/migrates the existing project photos from `https://svelectro.be` into Neon Object Storage and populates the Neon PostgreSQL database with initial content.

---

# 4. Custom CMS (`/admin`) Requirements
Build a secure, intuitive, and responsive CMS dashboard protected by session-based authentication (HTTP-only secure cookies):
1. **Authentication (`/admin/login`):** Secure login with hashed passwords, rate-limiting protection, and session management.
2. **Dashboard Overview (`/admin`):** Summary cards (Total Projects, Active Services, Unread Quote Inquiries, Published Testimonials) and recent incoming quote requests.
3. **Project Portfolio Manager (`/admin/projects`):**
   - Full CRUD (Create, Read, Update, Delete) for projects.
   - Multi-image drag-and-drop uploader connected directly to **Neon Object Storage**.
   - Ability to set a cover image, edit captions, reorder photos, toggle "Featured on Homepage", and assign categories.
4. **Services Manager (`/admin/services`):**
   - Create, edit, reorder, and toggle visibility of electrical services.
   - Upload service cover images to Neon Object Storage.
5. **Testimonials Manager (`/admin/testimonials`):**
   - Add, edit, approve/publish, or delete customer reviews.
6. **Inquiries / Leads Inbox (`/admin/inquiries`):**
   - View incoming quote requests from the landing page, update lead status (`Nieuw`, `Gecontacteerd`, `Offerte verstuurd`, `Afgerond`), and view any uploaded client attachments.
7. **Site & Hero Settings (`/admin/settings`):**
   - Edit Hero title, subtitle, hero image, contact details (phone, email, address, BTW number), social links, and SEO meta tags without touching code.

---

# 5. Technical Architecture & Deliverables
1. **Project Structure:** Provide a clean SvelteKit directory tree (`src/routes/(public)/...` for the landing page, `src/routes/admin/...` for the CMS, `src/lib/server/db/...`, `src/lib/server/storage.ts`).
2. **Environment Configuration:** Provide a complete `.env.example` detailing `DATABASE_URL` (Neon Postgres), `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_REGION`, `NEON_STORAGE_ACCESS_KEY_ID`, `NEON_STORAGE_SECRET_ACCESS_KEY`, `NEON_STORAGE_BUCKET`, and `AUTH_SECRET`.
3. **Code Implementation:** Generate production-ready, type-safe SvelteKit `+page.server.ts` load functions, form actions with progressive enhancement (`use:enhance`), Drizzle/Prisma schema, S3 storage helper, and clean Tailwind UI components.
4. **SEO & Performance:** Include dynamic `<svelte:head>` meta tags, OpenGraph tags, semantic HTML5 landmarks, and JSON-LD `Electrician` / `LocalBusiness` structured data for Belgian local SEO.