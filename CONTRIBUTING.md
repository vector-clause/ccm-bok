# Contributing to the CCM-BOK

Every page is a Markdown file in `src/content/docs/`. Edit it on GitHub or locally and open a pull request.

## Page status
- `stub`: outline entry only. Turn it into a `draft` by writing real content.
- `draft`: authored, not yet peer reviewed.
- `reviewed`: approved by at least two reviewers (one with relevant professional or legal expertise).

## Rules
1. **Cite primary sources.** Any statement about a contractual mechanism, forensic method, formula or legal rule must cite a primary source: the contract clause, statute, standard (e.g. SCL Delay and Disruption Protocol, AACE RPs, RICS guidance, ISO) or a reported case. Secondary sources (law-firm notes, blogs) may support but not replace them.
2. **No legal advice.** Describe, don't advise; note jurisdictional differences.
3. **Formulae** go in KaTeX (`$$ ... $$`), with every term defined and the source named.
4. **Citations.** Replace the draft-era numbers in `sources_unverified` with verified entries in `sources`; see `source/citation-review.csv` for lines that still need checking.
5. **Licence.** By contributing you license your text under CC BY-NC-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)). Don't paste copyrighted text from standards or books.
6. Keep frontmatter valid: `npm run build` validates it against `src/content.config.ts` and checks internal links.

## Local development
```bash
npm ci
npm test
npm run dev
```
Requires Node >= 22.23.4. The `npm run convert` script is a one-time bootstrap from the original outline and will not overwrite pages whose status is not `stub`.
