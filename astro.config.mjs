import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightLinksValidator from 'starlight-links-validator';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCcmLinks from './plugins/remark-ccm-links.mjs';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://ccm-bok.org',
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath, remarkCcmLinks], rehypePlugins: [rehypeKatex] }),
  },
  integrations: [
    starlight({
      title: 'CCM-BOK',
      description:
        'Open Contracts and Commercial Management Body of Knowledge for the construction industry.',
      customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
      components: { Head: './src/components/Head.astro' },
      sidebar: [
        { label: 'Overview', items: [{ autogenerate: { directory: 'overview' } }] },
        ...['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].map((v, i) => ({
          label: `Volume ${v}`,
          collapsed: true,
          items: [{ autogenerate: { directory: `volume-${i + 1}`, collapsed: true } }],
        })),
        { label: 'References', slug: 'references' },
      ],
      plugins: [
        starlightLlmsTxt({
          projectName: 'CCM-BOK',
          description:
            'Open Contracts and Commercial Management Body of Knowledge for construction. Content is CC BY-NC-SA 4.0.',
        }),
        starlightLinksValidator(),
      ],
    }),
  ],
});
