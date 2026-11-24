---
name: SV Electro
description: Kwaliteit in elektriciteit. A trusted local electrician's site that reads like a clean electrical drawing.
colors:
  live-wire: "#ff3300"
  live-wire-deep: "#d42a00"
  live-wire-pressed: "#b02300"
  live-wire-wash: "#fff3ef"
  switchboard-ink: "#0f1113"
  ink-panel: "#181b1f"
  ink-text: "#22272b"
  ink-muted: "#5c666e"
  ink-hairline: "#d1d5d9"
  ink-wash: "#f5f6f7"
  van-slate: "#8e9ca4"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 9vw, 6.75rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.5vw, 4rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 75"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'ss01', 'tnum'"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  button:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.025em"
rounded:
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "32px"
  grid-gap: "16px"
  section-sm: "80px"
  section-lg: "112px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.live-wire-deep}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.live-wire-pressed}"
    textColor: "{colors.paper}"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-panel}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-panel}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  chip-filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  chip-filter-selected:
    backgroundColor: "{colors.switchboard-ink}"
    textColor: "{colors.paper}"
  card-service-photo:
    backgroundColor: "{colors.ink-panel}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "28px"
  card-service:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-panel}"
    rounded: "{rounded.lg}"
    padding: "28px"
  icon-tile:
    backgroundColor: "{colors.live-wire-wash}"
    textColor: "{colors.live-wire-deep}"
    rounded: "{rounded.md}"
    size: "44px"
---

# Design System: SV Electro

## Overview

**Creative North Star: "The Installer's Drawing"**

The site reads like a clean electrical drawing brought to life. Dark ink panels carry a faint drafting grid. Photos are framed by heavy corner brackets, like the registration marks on a schematic. Every label is set in condensed capitals, as if lettered on a plan. Nothing is ornament for its own sake. Each mark either frames real work, labels a part or points to the next step: calling, or requesting a quote.

The system alternates between two surfaces. Switchboard ink (near-black) carries the hero, the about section, the header, the mobile action bar and the CMS sidebar. Paper white and a cool ink wash carry the reading and browsing sections. One hot colour, Live-Wire Orange, marks what is live: the primary action, the active state and the accent word in the headline. Real SV Electro project photos are the main imagery. The type and the drawing marks frame them; they never replace them.

Components should feel **solid, like switchgear**: decisive, tactile and sized for a thumb. Buttons are at least 44–48px tall and lift firmly on hover. Cards are crisp rectangles with only slightly eased corners.

**Key Characteristics:**
- Ink and paper surfaces alternate; one signal accent marks what is live.
- Condensed, heavy, uppercase Archivo for display and titles. Plain Archivo for reading.
- Drafting marks (a masked blueprint grid, 4px corner brackets) as the signature, kept to dark surfaces and photos.
- Flat at rest. Surfaces lift only in response to interaction or when an overlay opens.
- Only real project photography. No stock imagery.

## Colors

One saturated signal colour against a cool, slightly blue-grey ink scale, taken from the logo's plug, the wordmark and the company vans.

### Primary
- **Live-Wire Orange** (#ff3300): the logo colour. Use it on dark surfaces and for large graphic marks: the headline accent word, corner brackets, icons on ink, focus outlines and text selection. On white it is only 3.7:1, so **never use it for text or button fills on light surfaces**.
- **Live-Wire Deep** (#d42a00): the working accent on light surfaces. Use it for primary button fills, links, required-field asterisks, icon glyphs in tiles and the CMS unread badge (5.1:1 on white). Its CSS variable can be overridden in the CMS settings, and any override must keep at least 4.5:1 against white.
- **Live-Wire Pressed** (#b02300): hover and pressed state of the primary button, and form error text.
- **Live-Wire Wash** (#fff3ef): background of icon tiles on white, and the "Nieuw" status chip.

### Neutral
- **Switchboard Ink** (#0f1113): the dark surface for the hero, about section, header, mobile bar, CMS sidebar and modal backdrops. Also used for headings on white and selected filter chips.
- **Ink Panel** (#181b1f): dark cards (photo service tiles) and button text on outline buttons.
- **Ink Text** (#22272b): default body text on white.
- **Ink Muted** (#5c666e): secondary copy and captions. The 600 step (#464e55) is used for intro paragraphs.
- **Ink Hairline** (#d1d5d9): input borders, outline-button rings and unselected chip rings. The lighter #e8eaec is used for dividers and card rings. Placeholders use Ink Muted (#5c666e) so they pass 4.5:1.
- **Ink Wash** (#f5f6f7): background of the alternate light section (Diensten) and the CMS canvas.
- **Bulb Yellow** (#ffd23f): only inside the hero's load animation, where "ELEKTRICITEIT." flickers on like a light bulb (2 runs) before settling back to Live-Wire Orange. Never a resting colour.
- **Van Slate** (#8e9ca4): the grey of the company vans. It's a brand reference colour, used sparingly. It is not a text colour.
- **Paper** (#ffffff): the light surface, and text on ink.

### Named Rules
**The Live-Wire Rule.** Orange marks what is live: the next action, the current state or the accent word. If an element is neither clickable, active nor the headline's accent, it doesn't get orange.

**The Two-Orange Rule.** #ff3300 is for ink backgrounds and large graphics. #d42a00 is for text and fills on white. Never swap them.

## Typography

**Display Font:** Archivo variable (width 62–125, weight 400–900), with ui-sans-serif and system-ui as fallbacks
**Body Font:** Archivo (same family, normal width)

**Character:** One variable family does everything. Squeezed to about 72% width at weight 850 and set in capitals, Archivo reads like the lettering on a drawing or a van. At normal width it is a calm, plain reading face. Body text uses stylistic set 1 and tabular figures, so phone numbers and counts line up.

### Hierarchy
- **Display** (850, wdth 72, clamp(3.2rem, 9vw, 6.75rem), line-height 0.95, uppercase, -0.01em): the hero H1 only. The second line (the accent word) is set in Live-Wire Orange.
- **Headline** (850, wdth 72, clamp(2.4rem, 5.5vw, 4rem), line-height 0.95, uppercase): section H2s and CMS page titles (2.25–3rem).
- **Title** (800, wdth 75, 1.5rem, line-height 1, uppercase): service tile names (the first tile goes up to 1.875–2.25rem) and trust-bar item titles (1.125rem).
- **Body** (400, 1.125rem, line-height 1.625): section intros and hero subtitles (up to 1.25rem). Running text is 1rem. Keep it within about 36rem (max-w-xl).
- **Label** (700, 0.8125rem, 0.14em letter-spacing, uppercase): footer column headings and small field labels such as "Telefoon" in the contact list. Never a kicker above a section heading: the heading carries its own weight.

### Named Rules
**The Lettered-Plan Rule.** Condensed capitals are for names: headings, titles and the mobile menu. Sentences, descriptions and form copy are never set in condensed caps.

**The No-Kicker Rule.** No eyebrow or kicker label above a heading. Context that matters (like "Erkend elektricien · Heist-op-den-Berg" in the hero) sits below the headline, with an icon, as information.

## Layout

- **Container:** 80rem (1280px) max, centred. Side padding is 16px, then 24px from 640px, then 32px from 1024px.
- **Section rhythm:** 80px vertical padding on mobile, 112px from 640px up. The hero is tighter (48–80px top). Sections alternate ink → white → ink wash → white → ink, so the page has a visible beat.
- **Grids:** 16px gaps throughout. Services use a 4-column bento from 1024px (first tile 2×2, second tile 2×1, the rest 1×1, rows at least 15rem); on phones the compact tiles are content height. The portfolio uses a dense masonry with every fifth project spanning 2×2: 2 columns of 11rem rows on phones (12px gap), 16rem rows from 640px, 4 columns from 1024px. Section headers split into two columns from 1024px: H2 on the left, the intro aligned to the bottom-right.
- **Quote section:** intro and "Zo gaat het verder" first, then the form card, then the contact details. From 1024px the intro and details stack on the left and the form spans both rows on the right. Every quote button links to the form card (`#offerte`), not the section top.
- **Breakpoints:** 640px (sm), 768px (md: the phone number appears in the header), 1024px (lg: desktop navigation, the two-column hero, the CMS sidebar is pinned).
- **Mobile:** the header becomes a full-screen ink menu with display-size links. A fixed ink action bar (call + quote) sits at the bottom, respecting the safe-area inset; it appears once the hero buttons scroll away and steps aside while the form is on screen. Scroll padding is 5rem so anchor targets clear the sticky 4.5rem header.

## Elevation & Depth

Flat at rest. Depth mostly comes from the ink/paper alternation and 1px inset rings. Shadows appear only on interaction or for things that float above the page.

### Shadow Vocabulary
- **Live glow** (`box-shadow: 0 1px 0 rgb(255 255 255 / 0.2) inset, 0 8px 24px -8px rgb(212 42 0 / 0.6)`): the primary button only. It reads as a button that's switched on.
- **Lift** (Tailwind `shadow-xl`, together with `translateY(-4px)`): service and portfolio cards on hover.
- **Overlay** (Tailwind `shadow-2xl`): modals, toasts, the floating hero and about badges, the login card, and the photo being dragged in the CMS. No decorative glows or blurred colour blobs behind content.
- **Field inset** (Tailwind `shadow-xs`): resting form inputs.

### Named Rules
**The Switched-On Rule.** Elements are flat until they're touched. A shadow means "this responds" or "this sits above the page". It is never decoration on a static block.

## Shapes

Crisp rectangles with only slightly eased corners: 6px (rounded-md) for buttons, inputs, icon tiles, badges and toasts; 8px (rounded-lg) for cards, photos and modals. Only filter chips, status badges and count badges are fully rounded pills.

The signature shapes come from drafting:
- **Corner brackets:** two 56px L-shaped marks, 4px thick, in Live-Wire Orange, offset 12px outside a photo's top-left and bottom-right corners.
- **Blueprint grid:** 48px cells drawn in 1px white lines at 4.5% opacity, faded out with a mask. Used only on ink surfaces: the hero, about section, login and error pages.
- **Numbered steps:** small 28px ink squares with an orange tabular numeral, used only where the order is real information ("Zo gaat het verder").

### Named Rules
**The Drawing-Marks-on-Ink Rule.** The blueprint grid and other drafting marks belong to dark ink surfaces and to framing real photos. They never go on white or ink-wash sections, and they never stack two layers deep.

## Components

### Buttons
Solid, like switchgear: big, decisive, a firm lift.
- **Shape:** gently eased (6px). At least 48px tall (44px in the header; `btn-sm` is 36px, for the CMS only).
- **Primary:** Live-Wire Deep fill with white bold label and the live glow. A trailing arrow icon is common. Hover: lifts 2px and darkens to Live-Wire Pressed. Active: drops back. Transition 200ms with the snap easing.
- **Ghost (on ink):** transparent with a 1px white ring at 30% opacity. Hover: 10% white fill, the ring goes to 60%.
- **Outline (on white):** white with an Ink Hairline ring and ink text. Hover: the ring darkens to ink-400.
- **Focus:** a 3px Live-Wire Orange outline, offset 4px on buttons (2px elsewhere).

### Chips
- **Filter chip (portfolio):** a 44px-tall pill, bold 14px label with a muted count. Unselected: white with an Ink Hairline ring. Selected: Switchboard Ink fill with white text. It uses `aria-pressed`.
- **Status badge (CMS):** a small pill with a tinted wash and a ring: Nieuw (Live-Wire), Gecontacteerd (sky), Offerte verstuurd (amber), Afgerond (slate).

### Cards / Containers
- **Service tiles** are buttons named by their title (description as `aria-describedby`); "Meer info" is decorative.
- **Service photo tile (the first two):** Ink Panel with a cover photo at 70% opacity under an ink gradient. The text sits at the bottom. The icon tile has a solid Live-Wire Deep fill.
- **Service tile (the rest):** white with a light ink ring. The icon tile switches from wash to solid orange on hover.
- **Portfolio tile:** a photo filling an 8px-radius frame on an Ink Panel placeholder (dark while loading), under a strong ink gradient so captions stay readable. It opens a lightbox whose quote button pre-selects the matching service.
- **Trust bar item:** no card. A ruled column with a wash icon tile, a condensed uppercase title and a muted line.
- **Internal padding:** 24px, 28px from 640px.

### Inputs / Fields
- **Style:** white, 1px Ink Hairline border, 6px radius, 10×14px padding, a faint field inset. Placeholder in ink-400.
- **Focus:** the border turns Live-Wire Deep, plus a 2px Live-Wire ring at 25% opacity.
- **Error:** `aria-invalid` turns the border Live-Wire Deep. The message below is a semibold 14px line in Live-Wire Pressed, linked with `aria-describedby`. Fields are checked when you leave them; a blocked submit shows one form-level alert and focuses the first invalid field.
- **Required:** an orange asterisk, explained by a legend at the top of the form.
- **Label:** semibold 14px, ink text, 6px above the field.

### Navigation
- **Public header:** a sticky 4.5rem Switchboard Ink bar. It gains a 90% opacity blur and a hairline once scrolled. Links are semibold 15px in ink-200. On hover, and for the section in view (`aria-current="location"`), they go white with a 2px orange underline. On the right: the phone number with an orange phone icon (from 768px) and the primary button (from 640px).
- **Mobile menu:** a full-screen ink sheet with display-size uppercase links divided by hairlines. Each has an orange arrow and they stagger in. The call and quote buttons sit at the bottom.
- **CMS sidebar:** a 16rem ink column. The active item gets a 10% white fill and an orange icon. Unread inquiries show a Live-Wire Deep count badge. Off-canvas below 1024px.

### Mobile Action Bar
A signature component. A fixed, solid ink bar at the bottom of the screen on phones, with two equal buttons: ghost "Bellen" (orange phone icon) and primary "Gratis offerte". It slides in once the hero buttons are out of view, hides while the quote form is on screen, and is `inert` while hidden.

## Do's and Don'ts

### Do:
- **Do** use Live-Wire Deep (#d42a00) for every orange text or fill on a light surface, and Live-Wire Orange (#ff3300) only on ink or for large graphic marks.
- **Do** set headings in condensed, heavy uppercase Archivo (`display` utility) and keep descriptions in normal-width sentence case.
- **Do** frame hero and feature photos with the orange corner brackets, and use only real SV Electro project photography.
- **Do** keep touch targets at least 44px (buttons 48px), and keep the mobile action bar's call and quote actions on every public page.
- **Do** keep surfaces flat at rest and reserve shadows for hover lift, overlays and the primary button's glow.

### Don't:
- **Don't** use stock or generic electrician imagery. If there is no real photo, use an ink panel instead.
- **Don't** put the blueprint grid on white or ink-wash sections, or layer it twice.
- **Don't** set #ff3300 text or button fills on white (3.7:1 fails AA).
- **Don't** use orange on anything that isn't live: not decorative borders, section backgrounds or body text.
- **Don't** round cards beyond 8px or turn buttons into pills. Pills are reserved for filter chips and badges.
- **Don't** put an eyebrow or kicker label above a heading.
- **Don't** add decorative glows, blurred colour blobs or duplicated content strips.
