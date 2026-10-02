import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const pubDate = new Date().toISOString();
const usage = 'Usage: pnpm new-post <slug>\nExample: pnpm new-post my-first-post';
const help = `Create src/content/blog/<slug>/index.md as an unpublished draft.

${usage}

Slugs use lowercase letters, numbers, and single hyphens (e.g. my-first-post).
Title and description are placeholders; tags are empty; pubDate is the current UTC timestamp.
Existing files or post directories are never overwritten.
-h, --help  Show this help.
See README.md for the publishing workflow.`;

try {
  const { values, positionals } = parseArgs({
    options: { help: { type: 'boolean', short: 'h' } },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(help);
  } else {
    if (positionals.length !== 1) throw new Error(`Provide exactly one slug.\n${usage}`);
    const [slug] = positionals;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('Invalid slug. Use lowercase letters, numbers, and single hyphens, e.g. my-first-post.');
    }

    const blog = new URL('../src/content/blog/', import.meta.url);
    const directory = new URL(`${slug}/`, blog);
    const relativePath = `src/content/blog/${slug}/index.md`;
    if (existsSync(new URL(`${slug}.md`, blog))) {
      throw new Error(`A flat post already exists at src/content/blog/${slug}.md. Choose another slug.`);
    }

    // Exclusive directory creation also prevents concurrent runs or symlinks from overwriting a post.
    await mkdir(directory);
    await writeFile(new URL('index.md', directory), `---
title: "文章标题"
description: "一句话介绍。"
pubDate: ${pubDate}
tags: []
draft: true
---

正文从这里开始。
`, { flag: 'wx' });

    console.log(relativePath);
    console.error('Draft created. Edit the placeholders and set draft: false when ready to publish.');
  }
} catch (error) {
  const message = error.code === 'EEXIST'
    ? 'A post directory or file already exists for this slug. Choose another slug; nothing was overwritten.'
    : error.code === 'ENOENT'
      ? `Cannot find the blog directory at ${fileURLToPath(new URL('../src/content/blog/', import.meta.url))}. Check your project files.`
      : error.code === 'EACCES' || error.code === 'EPERM'
        ? 'Cannot create the post: permission denied. Check write access to src/content/blog/.'
        : error.message;
  console.error(`new-post: ${message}`);
  process.exitCode = 1;
}
