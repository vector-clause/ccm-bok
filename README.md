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
