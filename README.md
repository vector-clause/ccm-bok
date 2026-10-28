# CCM-BOK

Open, Git-backed Contracts and Commercial Management Body of Knowledge for the construction industry, built with Astro + Starlight.

- Content: `src/content/docs/` (Markdown + YAML frontmatter, KaTeX maths), licensed CC BY-NC-SA 4.0
- Machine access: `/llms.txt`, `/llms-full.txt`, and any page as raw Markdown by appending `.md`
- Original outline and bootstrap converter: `source/`, `scripts/convert/`

```bash
npm ci && npm run dev   # http://localhost:4321
npm test && npm run build
```

Most pages are stubs awaiting authored content; see [CONTRIBUTING.md](CONTRIBUTING.md).
Content: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md). Code: [MIT](LICENSE).

## Tooling
- **MCP server:** `npm run mcp` (stdio). Tools: `search_ccm`, `get_ccm_page`, `list_ccm_section`, `query_ccm_clause`. Results include page `status`; most pages are still stubs.
- **Browser editor (Decap CMS):** `npm run cms` in one terminal, `npm run dev` in another, then open `/admin/`. Edits become pull requests (editorial workflow). Production login needs a GitHub OAuth proxy; set `base_url` in `public/admin/config.yml`.
- **Auto-links:** first mention of each term/clause in `src/data/links.json` is linked to the page that covers it (`plugins/remark-ccm-links.mjs`). Add entries by page `id`.
- **Social cards:** generated per page at build time (`src/pages/og/`).
- **Deploy:** `.github/workflows/deploy.yml` publishes `dist/` to Cloudflare Pages on pushes to `main` (needs repo secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and optional variable `SITE_URL`).
