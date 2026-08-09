import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    image: z.string(),
    title_nl: z.string(),
    title_ti: z.string(),
    category: z.enum(['bruiloft', 'verjaardag', 'speciaal']),
    desc_nl: z.string(),
    desc_ti: z.string(),
    order: z.number().default(0),
  }),
})

export const collections = { gallery }
