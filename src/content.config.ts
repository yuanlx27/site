import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().trim().min(1)).default([]).transform(tags => [...new Set(tags)]),
    draft: z.boolean().default(false),
    heroImage: image().optional(),
    heroAlt: z.string().optional(),
  }).refine(post => !post.heroImage || Boolean(post.heroAlt?.trim()), {
    message: 'A hero image requires descriptive heroAlt text.',
    path: ['heroAlt'],
  }),
});

export const collections = { blog };
