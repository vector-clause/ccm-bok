import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        id: z.string().regex(/^ccm-[a-z0-9-]+$/).optional(),
        volume: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']).optional(),
        domain: z.string().optional(),
        section: z.string().optional(),
        type: z
          .enum(['concept', 'comparison', 'workflow', 'lexicon', 'register', 'overview'])
          .default('concept'),
        status: z.enum(['stub', 'draft', 'reviewed']).default('stub'),
        summary: z.string().optional(),
        standards_referenced: z
          .array(z.object({ standard: z.string(), clause: z.string().optional() }))
          .default([]),
        key_formula: z.string().optional(),
        related_concepts: z.array(z.string()).default([]),
        cross_contract_mapping: z.record(z.string()).optional(),
        sources: z.array(z.number().int().min(1)).default([]),
        // Best-guess reading of concatenated citation digits in the source; needs human confirmation.
        sources_unverified: z.array(z.number().int().min(1)).default([]),
        license: z.string().default('CC-BY-NC-SA-4.0'),
        last_audited: z.string().optional(),
        contributors: z.array(z.string()).default([]),
      }),
    }),
  }),
};
