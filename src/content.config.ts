import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    image: z.string(),
    title_nl: z.string(),
    title_ti: z.string().optional(),
    category: z.enum(['bruiloft', 'verjaardag', 'speciaal']),
    orderable: z.boolean().default(true),
  }),
})

export const collections = { gallery }
