# Langxi Yuan

A static, Chinese-first personal site built with Astro and handwritten CSS.
The visual source of truth is [DESIGN.md](DESIGN.md) and [DESIGN.zh.md](DESIGN.zh.md).

## Development

Requires Node.js 22.12+ and pnpm 11.23.0 (pinned in `package.json`).
If pnpm is not installed, follow the [pnpm installation guide](https://pnpm.io/installation).
Commit `pnpm-lock.yaml` when dependencies change. Dependency build scripts are
restricted to the allowlist in `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

## Make it yours

- **Identity and email:** `src/data/site.ts`. The public email is linked on the Contact page.
- **Biography and photo:** `src/pages/about.astro`. Replace the labeled portrait placeholder with a local image using Astro's `Image` component.
- **Current focus:** `src/pages/now.astro`; update `nowUpdated` in `src/data/site.ts` when editing.
- **Projects:** the handwritten list in `src/pages/projects.astro` currently describes this site and its typography specimen.
- **Writing:** `src/content/blog/**/*.md`. The three initial posts are explicitly labeled examples; replace or delete them before publishing your own writing.
- **Social image:** `public/og-default.png`.
- **Colors/type:** `src/styles/tokens.css`. Other global CSS lives beside it.

### Add a post

Run the command with one required slug:

```sh
pnpm new-post my-post
```

This creates `src/content/blog/my-post/index.md` with placeholder title and
description, `tags: []`, `draft: true`, and the command's current UTC timestamp
as `pubDate` (for example, `2026-10-03T12:34:56.789Z`).
No prompts or metadata flags. Slugs use lowercase letters, numbers, and single
hyphens. Existing directories and flat posts with the same slug are rejected;
nothing is overwritten. Use `pnpm new-post --help` for help.

Edit the placeholders and write your post, then set `draft: false` to publish.
Optionally add `updatedDate`, `heroImage: ./cover.jpg`, and descriptive `heroAlt`
text. Images can live beside the post's `index.md`.

The published URL is `/site/blog/my-post/`, without `/index/`.
Existing flat files such as `src/content/blog/my-post.md` still work too.
Posts are sorted newest-first, then by ID for equal dates. Drafts are visible
on the dev site for previewing. Production builds exclude drafts everywhere,
including direct routes, tag pages, RSS, and the sitemap.
Tag URLs preserve Chinese and other characters with URL encoding.
Reading time estimates count CJK characters separately from Latin words.
Use Markdown headings starting at `##` (the post title supplies the single `h1`).

### Fonts and themes

IM Fell English (+ SC) and Special Elite are self-hosted with Fontsource.
Code uses a self-hosted Latin subset of TT2020 Style E (SIL OFL 1.1); its
license and reproducible subsetting instructions live in `public/fonts/tt2020/`.
All local fonts use `font-display: swap`.
The only third-party runtime resource is the subsetted KingHwa Old Song font
from ZeoSeven. Its actual CSS family name is `KingHwaOldSong`. System serif
fallbacks keep the site usable if that CDN is unavailable.

The Xuan palette uses aged xuan paper with cinnabar accents in light mode and
gold accents on deep indigo in night mode, with a faint long-fiber paper texture.
The original JSON themes in `src/themes/` also supply build-time Shiki syntax
highlighting. CSS `light-dark()` keeps code colors in sync with the page theme.
The initial theme follows the OS in pure CSS. The footer control selects Xuan
Light, Xuan Night, or System. Its bundled, external TypeScript script persists explicit
overrides in localStorage. With JavaScript disabled, system themes and every
content page still work; the inactive theme control is hidden. A saved manual
override applies after the deferred module loads (no inline bootstrap script).
The masthead date is the UTC **build date**, not a live client-side clock.

## Deployment

The included GitHub Actions workflow checks, builds, tests, and deploys to
GitHub Pages on pushes to `main` or a manual run.
In the repository's **Settings → Pages**, choose **GitHub Actions** as the source.
The production URL is `https://yuanlx27.github.io/site/`, with `/site/` configured
as Astro's base path. No server adapter is required. Astro emits the custom error page as `dist/404.html`.

## Checks

`pnpm test` tests the post-creation command and checks the generated output after a build: required routes, local
links and assets, language/SEO semantics, one heading per page, external-only
scripts, RSS, sitemap, draft exclusion, and palette contrast. Responsive and
theme behavior should also be reviewed in a browser at 360, 768, and 1200px.
