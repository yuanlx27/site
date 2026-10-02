import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'langxi-new-post-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'scripts'));
  const blog = path.join(root, 'src/content/blog');
  await mkdir(blog, { recursive: true });
  const script = path.join(root, 'scripts/new-post.mjs');
  await copyFile(new URL('../scripts/new-post.mjs', import.meta.url), script);
  return {
    root, blog,
    // Run outside the project to verify paths are based on the script, not cwd.
    run: (...args) => spawnSync(process.execPath, [script, ...args], { cwd: tmpdir(), encoding: 'utf8' }),
  };
}

test('creates a folder-based draft with placeholders and the invocation timestamp', async t => {
  const { run, blog } = await fixture(t);
  const before = Date.now();
  const result = run('my-first-post');
  const after = Date.now();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'src/content/blog/my-first-post/index.md\n');
  assert.match(result.stderr, /Draft created/);
  const body = await readFile(path.join(blog, 'my-first-post/index.md'), 'utf8');
  assert.match(body, /^---\ntitle: "文章标题"\ndescription: "一句话介绍。"\n/);
  assert.match(body, /\ntags: \[\]\ndraft: true\n---\n\n正文从这里开始。\n$/);
  const date = body.match(/pubDate: (.+)/)[1];
  assert.equal(new Date(date).toISOString(), date);
  assert.ok(Date.parse(date) >= before && Date.parse(date) <= after);
  assert.deepEqual(await readdir(blog), ['my-first-post']);
});

test('missing, extra, unsafe, and unsupported arguments fail without creating files', async t => {
  const { run, blog } = await fixture(t);
  for (const args of [[], ['one', 'two'], ['../escape'], ['/absolute'], ['nested/post'],
    ['Uppercase'], ['two words'], ['double--hyphen'], ['-leading'], ['trailing-'],
    ['post.md'], [''], ['--title', 'Title'], ['--force']]) {
    const result = run(...args);
    assert.notEqual(result.status, 0, JSON.stringify(args));
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /new-post:/);
    assert.doesNotMatch(result.stderr, /\n\s+at /);
    assert.deepEqual(await readdir(blog), []);
  }
});

test('help succeeds without writing or prompting', async t => {
  const { run, blog } = await fixture(t);
  for (const flag of ['--help', '-h']) {
    const result = run(flag);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage: pnpm new-post <slug>/);
    assert.equal(result.stderr, '');
  }
  assert.deepEqual(await readdir(blog), []);
});

test('never overwrites an existing post directory or a legacy flat file', async t => {
  const { run, blog } = await fixture(t);
  assert.equal(run('existing').status, 0);
  const file = path.join(blog, 'existing/index.md');
  await writeFile(file, 'Keep this edited post.');
  assert.notEqual(run('existing').status, 0);
  assert.equal(await readFile(file, 'utf8'), 'Keep this edited post.');
  await mkdir(path.join(blog, 'empty-directory'));
  assert.notEqual(run('empty-directory').status, 0);
  assert.deepEqual(await readdir(path.join(blog, 'empty-directory')), []);
  await writeFile(path.join(blog, 'legacy.md'), 'Keep this flat post.');
  const legacy = run('legacy');
  assert.notEqual(legacy.status, 0);
  assert.match(legacy.stderr, /flat post already exists/);
  assert.equal(await readFile(path.join(blog, 'legacy.md'), 'utf8'), 'Keep this flat post.');
  assert.deepEqual(await readdir(blog), ['empty-directory', 'existing', 'legacy.md']);
});

test('a missing blog directory gives an actionable error', async t => {
  const { run, blog } = await fixture(t);
  await rm(blog, { recursive: true });
  const result = run('my-post');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cannot find the blog directory/);
  assert.equal(result.stdout, '');
});
