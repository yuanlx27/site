import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export const postUrl = (id: string) => `${import.meta.env.BASE_URL}blog/${id.split('/').map(encodeURIComponent).join('/')}/`;
export const tagUrl = (tag: string) => `${import.meta.env.BASE_URL}blog/tags/${encodeURIComponent(tag)}/`;

// Count CJK characters separately from space-delimited words in mixed-script posts.
export function readingMinutes(body: string = '') {
  const cjk = body.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu)?.length ?? 0;
  const words = body.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, ' ')
    .match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(cjk / 300 + words / 200));
}
