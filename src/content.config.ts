import { defineCollection, z } from 'astro:content'
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // #703: an EE-badged page NAMES the entitlement lever(s) it documents. check-ee-badges.mjs
        // reconciles these declarations against the generated levers reference (the pulled,
        // catalog-derived single truth) in both directions — no hand-kept EE list anywhere.
        wikisteadEeLevers: z.array(z.string()).optional(),
      }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
}
