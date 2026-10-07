---
name: Langxi Yuan — Xuan
colors:
  background: "#efe5cb"
  surface: "#e3d6b4"
  text: "#25211c"
  secondary: "#5d554a"
  primary: "#a82e24"
  hover: "#7a1f19"
  border: "#b5a687"
  selection: "#c9b98f"
  night-background: "#1a2030"
  night-surface: "#232b3d"
  night-text: "#e6dcc3"
  night-secondary: "#a9a595"
  night-border: "#3b4560"
  night-primary: "#d8b25f"
  night-hover: "#f0cf86"
---

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

Inspired by hand-copied Chinese manuscripts: ink on xuan paper (宣纸) with a cinnabar seal (朱砂印), and, for dark mode, gold ink on indigo-dyed paper (绀纸金字). Defined as CSS custom properties on `:root`.

These site colors are implemented in `src/styles/tokens.css`. The site palette is intentionally distinct from the editor backgrounds in the syntax-theme JSON files.

**Light: "xuan paper"**

| Token | Value | Traditional reference | Use |
|---|---|---|---|
| `--paper` | `#efe5cb` | 宣纸 xuan paper, slightly aged | Page background |
| `--paper-deep` | `#e3d6b4` | 缣帛 aged silk | Cards, code blocks, table stripes |
| `--ink` | `#25211c` | 墨 soot ink | Body text (never pure black) |
| `--ink-soft` | `#5d554a` | 淡墨 diluted ink | Dates, captions, secondary text |
| `--rule` | `#b5a687` | 赭 faint ochre | Lines and borders |
| `--accent` | `#a82e24` | 朱砂 cinnabar | Links, small highlights, the seal |
| `--accent-hover` | `#7a1f19` | 绛 deep crimson | Link hover |

**Dark: "gold on indigo"**

| Token | Value | Traditional reference / use |
|---|---|---|
| `--paper` | `#1a2030` | 绀青 deep indigo-dyed paper |
| `--paper-deep` | `#232b3d` | Cards, code blocks |
| `--ink` | `#e6dcc3` | 月白 moon white |
| `--ink-soft` | `#a9a595` | Secondary text |
| `--rule` | `#3b4560` | Lines and borders |
| `--accent` | `#d8b25f` | 泥金 gold ink |
| `--accent-hover` | `#f0cf86` | Lighter gold |

**Syntax colors** use mineral pigments. The supplied spec calls the theme files `shiki/xuan-light.json` and `shiki/xuan-night.json`; their existing repository paths are `src/themes/xuan-light.json` and `src/themes/xuan-night.json`. Astro's built-in Shiki uses these files for code fences.

| Token | Light | Night | Pigment |
|---|---|---|---|
| Keywords, tags | `#a02a21` | `#e8806c` | 朱砂 cinnabar |
| Strings | `#365f4b` | `#8fc0a0` | 石绿 malachite |
| Numbers, constants | `#7c4f08` | `#e6b94a` | 藤黄 gamboge |
| Functions, links | `#2a4d78` | `#86a9d6` | 石青 azurite |
| Types, classes | `#5a3f6b` | `#c9a6cc` | 绀紫 dark violet |
| Comments | `#5f564a` | `#9aa0b0` | 淡墨 pale ink |

Additional tokens retained from the editor themes:

| Token | Light | Night | Use |
|---|---|---|---|
| `--selection` | `#c9b98f` | `#38466a` | Selected text background |
| `--code-ink` | `#365f4b` | `#8fc0a0` | Inline code |

Rules:
- Cinnabar is the single accent in light mode, gold in dark. Use sparingly, like a seal on a page; reserve the wider mineral-pigment palette for syntax.
- Optional: a small square "seal" (a single character or initial, in `--accent`) beside the masthead, cinnabar in light mode and gold in night mode.
- All body, link, and syntax text must be checked at WCAG AA (4.5:1) or better against its actual background. Check both paper surfaces, including code backgrounds. `--rule` and line numbers are decorative and intentionally lower contrast.
- Code fences retain the JSON syntax colors. Inline code uses green; plain unhighlighted code uses body ink.
- Selected text retains body ink over the supplied selection background.
- Print remains neutral white paper and black ink.
- If adding paper grain, prefer faint long fibers (xuan paper) over fine noise, at 3-6% opacity in light mode; reduce it in night mode.

The default follows `prefers-color-scheme` in pure CSS; the footer's
**Xuan Light / Xuan Night / System** control persists the existing light/dark
override via a bundled TypeScript script. Syntax colors follow the same
`color-scheme` using native CSS `light-dark()`, with no extra client JavaScript.
Night retains reduced grain opacity (2%) against its indigo background.

### 3.2 Typography

| Role | Font | Fallback |
|---|---|---|
| Headings / masthead | IM Fell English (SC for small-caps work) | Georgia, serif |
| Body (English) | IM Fell English | Georgia, serif |
| Body (Chinese) | KingHwa Old Song, subsetted via CDN — see DESIGN.zh.md | Songti SC, Noto Serif CJK SC, serif |
| Accents (dates, tags, labels) | Special Elite (typewriter) | "Courier New", monospace |
| Code | TT2020 Style E (lightly worn typewriter, strictly monospaced) | ui-monospace, monospace |

- Self-host the Latin fonts: IM Fell English (+ SC) and Special Elite via Fontsource — only the weights actually used. TT2020 Style E is not on Fontsource or Google Fonts; self-host it manually as a Latin-subset woff2 (~800KB, calt alternates kept) from the upstream repo (OFL 1.1). The single exception to self-hosting is the Chinese webfont (subsetted CDN), covered in DESIGN.zh.md.
- Code font rationale: wear must be hinted at, never heavy-handed — TT2020 Style E sits between the faded Style D and the heavy-ink Style B, keeping letterforms intact and fully readable with only lightly uneven ink. Styles F/G are too rough for body-size code; Special Elite was rejected for code because it is not truly monospaced.
- Body: 18-20px, line-height 1.65, measure of 60-70 characters (`max-width: ~38rem`).
- Headings: slightly tight line-height (1.2), small-caps or letter-spaced for section labels.
- Use a **drop cap** on the first paragraph of posts (CSS `::first-letter`).
- Turn on proper typographic details: `font-variant-numeric: oldstyle-nums`, `text-wrap: balance` on headings, `hyphens: auto` on body (Latin only).
- All CJK / mixed-script typesetting rules (font-stack order, line-height, drop cap, punctuation, dates) live in **DESIGN.zh.md**.

### 3.3 Texture

- Subtle paper grain over `--paper`: prefer faint long xuan-paper fibers over fine noise, at 3-6% opacity in light mode and about 2% in night mode. An inline SVG filter (`feTurbulence`) with anisotropic frequencies (`.015 .65`) provides long fibers without a separate image download.
- Optional soft vignette (radial gradient) at the page edges. Keep it faint.
- Respect `prefers-reduced-motion` and avoid anything that makes text harder to read. Texture must never sit over text at high contrast.

### 3.4 Print-style details

- **Rules:** thin double rule under the masthead and between major sections (`border-top: 3px double var(--rule)`).
- **Masthead:** site name set large and centered, with a small tagline and a dateline ("Saturday, 3 October 2026") in the typewriter font.
- **Ornaments:** a small centered fleuron (`❦` or `⁂`) as the section divider instead of `<hr>`.
- **Links:** underlined in `--accent` with a thin offset underline; light-mode cinnabar deepens to crimson on hover, while night-mode gold brightens.
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
│  ├─ themes/
│  │  ├─ xuan-light.json     mineral-pigment syntax colors
│  │  └─ xuan-night.json
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
- **Colors:** Xuan Light (ink on xuan paper with cinnabar) and Xuan Night (gold on indigo); target tokens in §3.1. CSS-first system default plus a TS-only toggle.
- **Tags:** tag pages at launch. **Search:** not planned.
- **Language:** content primarily Chinese with English mixed in; UI chrome in English; no i18n routing — the font stack gives both scripts a consistent look (see DESIGN.zh.md).
- **Fonts:** English defaults to IM Fell English; Chinese defaults to KingHwa Old Song (subsetted CDN); code defaults to TT2020 Style E (subsetted, self-hosted).
- **Hosting/domain:** GitHub Pages at `https://yuanlx27.github.io` (repo renamed to match).

---

## 12. Reference

- Astro docs: https://docs.astro.build
- Astro theme library (for inspiration): https://astro.build/themes
- Fonts: IM Fell English (+ SC), Special Elite via Fontsource; TT2020 Style E (OFL, https://github.com/ctrlcctrlv/TT2020) self-hosted as a Latin-subset woff2; KingHwa Old Song via zeoseven CDN (DESIGN.zh.md)
- Theme-toggle reference implementation (we deviate to CSS-first, TS-only): https://github.com/rnt-rez/minrock
