# DESIGN.md

Design spec for my personal site: a blog plus "more about me" pages, styled like an aged printed page. Built with Astro, hand-written CSS, and no UI framework.

Items marked **[decide]** are open choices. Everything else is a default I can change.

---

## 1. Goals

- Publish writing and show who I am, in one place.
- Feel like a printed page: warm paper, dark ink, serif type, thin rules.
- Load fast and read well on phones. Static output, almost no JavaScript.
- Be cheap to maintain: new posts are Markdown files, and nothing needs upgrading often.

**Non-goals:** logins, comments, a database, heavy animation, a CMS (for now).

---

## 2. Site structure

| Route | Purpose |
|---|---|
| `/` | Home: short intro, latest 3-5 posts, link to About |
| `/about` | Longer personal page: story, interests, photo |
| `/blog` | All posts, newest first, grouped by year |
| `/blog/[slug]` | Single post |
| `/blog/tags/[tag]` | Posts by tag |
| `/projects` | Short list of projects, 2-3 entries to start |
| `/now` | What I'm focused on right now, with an "updated" date |
| `/contact` | Email and links (no form at launch) |
| `/rss.xml` | RSS feed |
| `/404` | Styled "page not found" |

Navigation: Home, Blog, Projects, About, Now, Contact. Six items fit as a single row on desktop and a wrapped or toggled row on mobile.

---

## 3. Visual language

**Concept:** a small-press broadsheet crossed with an old paperback. Calm, a little worn, never cluttered.

### 3.1 Color

Defined as CSS custom properties on `:root`.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f4ecd8` | Page background |
| `--paper-deep` | `#e9dec3` | Cards, code blocks, table stripes |
| `--ink` | `#2b2118` | Body text (never pure black) |
| `--ink-soft` | `#6b5a45` | Dates, captions, secondary text |
| `--rule` | `#b9a98a` | Lines and borders |
| `--accent` | `#8b2e2a` | Links, small highlights (oxblood red) |
| `--accent-hover` | `#5e1d1a` | Link hover |

Rules:
- One accent color only. Use it sparingly.
- Check contrast for all text/background pairs (target WCAG AA, 4.5:1 for body text). `--ink-soft` is the one most likely to need darkening.

**Dark mode ("lamplight")** ships at launch. The default follows `prefers-color-scheme` in pure CSS (no inline script, no flash for users who never toggle); a manual light/dark/system toggle persists its override via a bundled TypeScript component script (see `ThemeToggle.astro` in §5). The dark tokens:

| Token | Value |
|---|---|
| `--paper` | `#1e1913` |
| `--paper-deep` | `#2a231a` |
| `--ink` | `#e8dcc2` |
| `--ink-soft` | `#a89a80` |
| `--rule` | `#4a3f30` |
| `--accent` | `#d08a5c` |

### 3.2 Typography

| Role | Font | Fallback |
|---|---|---|
| Headings / masthead | IM Fell English (SC for small-caps work) | Georgia, serif |
| Body (English) | IM Fell English | Georgia, serif |
| Body (Chinese) | KingHwa Old Song, subsetted via CDN — see DESIGN.zh.md | Songti SC, Noto Serif CJK SC, serif |
| Accents (dates, tags, labels) | Special Elite (typewriter) | "Courier New", monospace |
| Code | A plain monospace, e.g. IBM Plex Mono | ui-monospace, monospace |

- Self-host the Latin fonts (e.g., via Fontsource): IM Fell English (+ SC), Special Elite, IBM Plex Mono — only the weights actually used. The single exception to self-hosting is the Chinese webfont (subsetted CDN), covered in DESIGN.zh.md.
- Body: 18-20px, line-height 1.65, measure of 60-70 characters (`max-width: ~38rem`).
- Headings: slightly tight line-height (1.2), small-caps or letter-spaced for section labels.
- Use a **drop cap** on the first paragraph of posts (CSS `::first-letter`).
- Turn on proper typographic details: `font-variant-numeric: oldstyle-nums`, `text-wrap: balance` on headings, `hyphens: auto` on body (Latin only).
- All CJK / mixed-script typesetting rules (font-stack order, line-height, drop cap, punctuation, dates) live in **DESIGN.zh.md**.

### 3.3 Texture

- Subtle paper grain over `--paper`, done with an inline SVG noise filter (`feTurbulence`) as a background image at very low opacity (3-6%), so there is no image file to download.
- Optional soft vignette (radial gradient) at the page edges. Keep it faint.
- Respect `prefers-reduced-motion` and avoid anything that makes text harder to read. Texture must never sit over text at high contrast.

### 3.4 Print-style details

- **Rules:** thin double rule under the masthead and between major sections (`border-top: 3px double var(--rule)`).
- **Masthead:** site name set large and centered, with a small tagline and a dateline ("Saturday, 3 October 2026") in the typewriter font.
- **Ornaments:** a small centered fleuron (`❦` or `⁂`) as the section divider instead of `<hr>`.
- **Links:** underlined in `--accent` with a thin offset underline, darkening on hover.
- **Images:** slight sepia treatment (`filter: sepia(.2) contrast(.95)`) and a thin border, with italic captions below.
- **Blockquotes:** left rule, italic, indented, like a pull quote.
- **Footnotes:** small, numbered, set below a short rule.

---

## 4. Layout

- Single column, centered, `max-width` about 42rem for text pages. Wider (about 60rem) for the Projects grid.
- Spacing scale based on one unit (`--space: 0.5rem`) and multiples: 1, 2, 3, 5, 8.
- Header: masthead on top, nav row below, separated by the double rule.
- Footer: thin rule, copyright, RSS link, and a "Set in [fonts]" colophon line.

**Responsive:**
- Mobile-first. Test at 360px, 768px, and 1200px.
- Nav wraps to two lines on mobile. Six short English labels make this acceptable; revisit only if it ever looks broken.
- Tables and code blocks scroll horizontally inside their own container, never the whole page.

---

## 5. Components

Each is an `.astro` file in `src/components/`.

| Component | Notes |
|---|---|
| `Masthead.astro` | Site title, tagline, dateline |
| `Nav.astro` | Links with `aria-current="page"` on the active item |
| `PostList.astro` | Title, date (typewriter font), one-line summary, tags |
| `PostMeta.astro` | Date, reading time, tags |
| `Prose.astro` | Wrapper that styles rendered Markdown (headings, lists, quotes, code, images) |
| `Ornament.astro` | Fleuron divider |
| `ProjectCard.astro` | Title, year, short description, link |
| `Footer.astro` | Colophon, RSS, copyright |
| `ThemeToggle.astro` | Light / dark / system. Bundled TypeScript `<script>` only — no inline JS anywhere; the CSS media query carries the untoggled default |

---

## 6. Content model

Blog posts use an Astro content collection in `src/content/blog/`, one Markdown or MDX file per post.

```yaml
---
title: "Post title"
description: "One sentence summary used in lists and meta tags."
pubDate: 2026-10-03
updatedDate: 2026-10-10   # optional
tags: ["notes", "life"]
draft: false
heroImage: ./cover.jpg    # optional
---
```

Projects can be a second collection (`src/content/projects/`) with `title`, `year`, `summary`, `url`, and `repo`. Alternatively, start with a hand-written list on the Projects page and migrate later.

---

## 7. Project structure

```
/
├─ public/              favicon, og-default.png
├─ src/
│  ├─ components/
│  ├─ content/
│  │  ├─ blog/
│  │  └─ projects/
│  ├─ layouts/
│  │  ├─ BaseLayout.astro     <head>, masthead, footer
│  │  └─ PostLayout.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ about.astro
│  │  ├─ now.astro
│  │  ├─ contact.astro
│  │  ├─ projects.astro
│  │  ├─ 404.astro
│  │  ├─ rss.xml.js
│  │  └─ blog/
│  │     ├─ index.astro
│  │     └─ [...slug].astro
│  └─ styles/
│     ├─ tokens.css       colors, type scale, spacing
│     ├─ base.css         reset, body, links, texture
│     └─ prose.css        styles for rendered Markdown
├─ astro.config.mjs
├─ DESIGN.md
└─ DESIGN.zh.md         Chinese / mixed-script typesetting conventions
```

**CSS approach:** plain CSS with custom properties, imported once in `BaseLayout.astro`. Component-specific styles go in each component's `<style>` block (Astro scopes them automatically). No Tailwind.

---

## 8. Accessibility

- Semantic HTML: one `<h1>` per page, `<nav>`, `<main>`, `<article>`, `<time datetime>`.
- "Skip to content" link as the first focusable element.
- Visible focus styles that match the theme (a 2px `--accent` outline).
- Text contrast at AA or better in both color modes.
- Alt text on every meaningful image; decorative texture lives in CSS only.
- Never rely on color alone to mark links. They stay underlined.
- Honor `prefers-reduced-motion` and `prefers-color-scheme`.

---

## 9. Performance and SEO

- Static output, with zero client-side JavaScript unless a component truly needs it.
- Optimize images with Astro's `<Image />` component; use `loading="lazy"` below the fold.
- Preload the one or two fonts used above the fold; use `font-display: swap`.
- Per-page `<title>` and meta description, canonical URL, Open Graph and Twitter tags, sitemap (`@astrojs/sitemap`), and the RSS feed.
- The Chinese webfont CDN is the site's only third-party runtime dependency; everything else is self-hosted.
- Target Lighthouse 95+ across all four categories.

---

## 10. Build plan

1. **Scaffold:** ✅ done — Astro basics template, committed to Git.
2. **Tokens and base styles:** colors, fonts, paper texture, body type. Check the look on a placeholder page before building anything else.
3. **Layout:** masthead, nav, footer, `BaseLayout`.
4. **Blog:** listing page, post layout, `Prose` styles (drop cap, quotes, code, images), RSS.
5. **Pages:** About, Projects, Now, Contact, 404, with real content.
6. **Polish:** responsive pass, accessibility pass, dark mode if wanted, Open Graph image.
7. **Deploy:** GitHub Pages. The repo is renamed to `yuanlx27.github.io` so the site serves at the root URL; set `site: 'https://yuanlx27.github.io'` in `astro.config.mjs`. A custom domain can be added later.

---

## 11. Decisions (locked)

- **Feel:** newspaper-meets-book, a *well-preserved* old print — wear is hinted at, never heavy-handed.
- **Site name:** Langxi Yuan. **Tagline:** "An ordinary man with an extraordinary dream".
- **Dark mode:** light and lamplight both ship at launch; CSS-first system default plus a TS-only toggle.
- **Tags:** tag pages at launch. **Search:** not planned.
- **Language:** content primarily Chinese with English mixed in; UI chrome in English; no i18n routing — the font stack gives both scripts a consistent look (see DESIGN.zh.md).
- **Fonts:** English defaults to IM Fell English; Chinese defaults to KingHwa Old Song (subsetted CDN).
- **Hosting/domain:** GitHub Pages at `https://yuanlx27.github.io` (repo renamed to match).

---

## 12. Reference

- Astro docs: https://docs.astro.build
- Astro theme library (for inspiration): https://astro.build/themes
- Fonts: IM Fell English (+ SC), Special Elite, IBM Plex Mono via Fontsource; KingHwa Old Song via zeoseven CDN (DESIGN.zh.md)
- Theme-toggle reference implementation (we deviate to CSS-first, TS-only): https://github.com/rnt-rez/minrock
