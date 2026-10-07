import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const origin = 'https://yuanlx27.github.io';
const basePath = '/site/';
const allFiles = await readdir(root, { recursive: true });
const htmlFiles = allFiles.filter(file => file.endsWith('.html'));
const pages = await Promise.all(htmlFiles.map(async file => ({
  file, html: await readFile(path.join(root, file), 'utf8'),
})));

test('all required pages and publication assets are generated', async () => {
  for (const file of [
    'index.html', 'about/index.html', 'blog/index.html',
    'projects/index.html', 'now/index.html', 'contact/index.html', '404.html',
    'rss.xml', 'sitemap-index.xml', 'sitemap-0.xml', 'og-default.png',
    'favicon.svg', 'robots.txt', '.nojekyll',
  ]) await access(path.join(root, file));
});

test('pages have language, semantic structure, SEO, and no inline scripts', () => {
  for (const { file, html } of pages) {
    assert.match(html, /<html[^>]*lang="zh-CN"/, file);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, file);
    assert.equal((html.match(/<main(?:\s|>)/g) ?? []).length, 1, file);
    assert.match(html, /<a[^>]*href="#content"/, file);
    assert.match(html, /<title>[^<]+<\/title>/, file);
    assert.match(html, /name="description" content="[^"]+"/, file);
    assert.match(html, /rel="canonical" href="https:\/\/yuanlx27.github.io\/site\//, file);
    assert.match(html, /property="og:image" content="https:\/\/yuanlx27.github.io\/site\//, file);
    assert.match(html, /name="twitter:card" content="summary_large_image"/, file);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, `${file}: only the theme module should ship`);
    for (const [, attributes, body] of scripts) {
      assert.match(attributes, /\bsrc="\/site\/_astro\/[^"]+\.js"/, file);
      assert.equal(body.trim(), '', `${file}: no inline JavaScript`);
    }
    assert.doesNotMatch(html, /\son(?:click|change|load)\s*=/i, file);
    const current = [...html.matchAll(/aria-current="page"/g)];
    assert.equal(current.length, file === '404.html' ? 0 : 1, file);
  }
});

test('every local link, fragment, and asset resolves', async () => {
  for (const { file, html } of pages) {
    const base = new URL(basePath + file.replace(/index\.html$/, ''), origin);
    for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(raw.replaceAll('&amp;', '&'), base);
      if (url.origin !== origin) continue;
      assert.ok(url.pathname.startsWith(basePath), `${file}: URL outside base path: ${raw}`);
      let local = decodeURIComponent(url.pathname.slice(basePath.length));
      if (!path.extname(local)) local = path.join(local, 'index.html');
      const target = path.join(root, local);
      await assert.doesNotReject(access(target), `${file} → ${raw}`);
      if (url.hash && target.endsWith('.html')) {
        const targetHTML = await readFile(target, 'utf8');
        assert.ok(targetHTML.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `${file}: missing fragment ${raw}`);
      }
    }
  }
});

test('code uses the self-hosted TT2020 Latin subset with a Chinese fallback', async () => {
  const css = (await Promise.all(allFiles.filter(file => file.endsWith('.css'))
    .map(file => readFile(path.join(root, file), 'utf8')))).join('\n');
  assert.match(css, /--font-code:\s*["']?TT2020 Style E["']?,\s*["']?KingHwaOldSong/);
  assert.match(css, /\.prose code\s*\{[^}]*font-family:var\(--font-code\)/);
  const face = css.match(/@font-face\s*\{[^}]*font-family:["']?TT2020 Style E["']?[^}]*\}/)?.[0];
  assert.ok(face, 'TT2020 @font-face must be included in the built CSS');
  assert.match(face, /font-display:swap/);
  assert.match(face, /\/site\/fonts\/tt2020\/tt2020-style-e-latin-400-normal\.woff2/);
  assert.match(face, /unicode-range:/);
  assert.doesNotMatch(css, /IBM Plex Mono|ibm-plex-mono/);
  const font = await readFile(path.join(root, 'fonts/tt2020/tt2020-style-e-latin-400-normal.woff2'));
  assert.equal(font.toString('ascii', 0, 4), 'wOF2');
  assert.ok(font.length < 900 * 1024, 'ship a subset, not the full font');
  const license = await readFile(path.join(root, 'fonts/tt2020/OFL.txt'), 'utf8');
  assert.match(license, /Fredrick R\. Brennan/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
});

test('Chinese tag pages, chronological listings, RSS, and draft exclusion agree', async () => {
  const archive = await readFile(path.join(root, 'blog/index.html'), 'utf8');
  const dates = [...archive.matchAll(/<time[^>]*datetime="([^"]+)"/g)]
    .map(([, date]) => date).slice(1); // The first date belongs to the masthead.
  assert.deepEqual(dates, [...dates].sort().reverse());
  const rss = await readFile(path.join(root, 'rss.xml'), 'utf8');
  assert.match(rss, /<language>zh-CN<\/language>/);
  assert.equal((rss.match(/<item>/g) ?? []).length, dates.length);
  const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /\/404\//);
  for (const { file, html } of pages) {
    assert.doesNotMatch(html, /Unpublished draft|draft-only/, file);
    if (file.startsWith('blog/') && !file.includes('/tags/') && file !== 'blog/index.html') {
      const url = new URL(basePath + file.replace(/index\.html$/, ''), origin).href;
      assert.ok(rss.includes(url), `RSS missing ${url}`);
      assert.ok(sitemap.includes(url), `Sitemap missing ${url}`);
    }
  }
  assert.doesNotMatch(rss + sitemap, /draft-example|draft-only/);
  assert.ok(!allFiles.some(file => /draft-example|draft-only/.test(file)));
  for (const [, href] of archive.matchAll(/href="(\/site\/blog\/tags\/[^"]+)"/g)) {
    const tagPage = await readFile(path.join(root, decodeURIComponent(href.slice(basePath.length)), 'index.html'), 'utf8');
    assert.match(tagPage, /Filed under/);
  }
});

const luminance = hex => {
  const values = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
};

test('site palettes match DESIGN.md independently of the syntax themes', async () => {
  const css = await readFile('src/styles/tokens.css', 'utf8');
  const design = await readFile('DESIGN.md', 'utf8');
  const sections = [
    design.split('**Light:')[1].split('**Dark:')[0],
    design.split('**Dark:')[1].split('**Syntax colors**')[0],
  ];
  const palettes = [...css.matchAll(/--paper: (#[a-f\d]+);([\s\S]*?)--grain-opacity/g)];
  assert.equal(palettes.length, 3); // Light, system dark, explicit dark.
  for (const [index, [, paper, rest]] of palettes.entries()) {
    const expected = [...sections[index === 0 ? 0 : 1]
      .matchAll(/\| `--([\w-]+)` \| `(#[a-f\d]+)` \|/g)];
    assert.equal(expected.length, 7);
    const tokens = { paper, ...Object.fromEntries([...rest.matchAll(/--([\w-]+): (#[a-f\d]+);/g)]
      .map(([, key, value]) => [key, value])) };
    for (const [, key, value] of expected) assert.equal(tokens[key], value, `${index}: ${key}`);
    const theme = JSON.parse(await readFile(`src/themes/xuan-${index === 0 ? 'light' : 'night'}.json`, 'utf8'));
    assert.equal(tokens.selection, theme.colors['editor.selectionBackground']);
    assert.equal(tokens['code-ink'], theme.tokenColors
      .find(token => token.scope.includes('markup.inline.raw')).settings.foreground);
  }
});

test('syntax text meets WCAG AA on its editor background in both themes', async () => {
  for (const name of ['light', 'night']) {
    const theme = JSON.parse(await readFile(`src/themes/xuan-${name}.json`, 'utf8'));
    const background = luminance(theme.colors['editor.background']);
    const colors = [theme.colors['editor.foreground'], ...theme.tokenColors
      .map(token => token.settings.foreground).filter(Boolean)];
    for (const color of colors) {
      const foreground = luminance(color);
      const contrast = (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
      assert.ok(contrast >= 4.5, `${name}: ${color}: ${contrast.toFixed(2)}:1`);
    }
  }
});

test('all text tokens meet WCAG AA on both paper surfaces in both themes', async () => {
  const css = await readFile('src/styles/tokens.css', 'utf8');
  const palettes = [...css.matchAll(/--paper: (#[a-f\d]+);([\s\S]*?)--grain-opacity/g)];
  assert.equal(palettes.length, 3); // Light, system dark, explicit dark.
  for (const [, paper, rest] of palettes) {
    const tokens = Object.fromEntries([...rest.matchAll(/--([\w-]+): (#[a-f\d]+);/g)].map(([, key, value]) => [key, value]));
    const selectionContrast = (luminance(tokens.ink) + .05) / (luminance(tokens.selection) + .05);
    assert.ok(Math.max(selectionContrast, 1 / selectionContrast) >= 4.5, 'selected text contrast');
    for (const background of [paper, tokens['paper-deep']]) {
      for (const name of ['ink', 'ink-soft', 'accent', 'accent-hover', 'code-ink']) {
        const a = luminance(background), b = luminance(tokens[name]);
        const contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        assert.ok(contrast >= 4.5, `${name} on ${background}: ${contrast.toFixed(2)}:1`);
      }
    }
  }
});
