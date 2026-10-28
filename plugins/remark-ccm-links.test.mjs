import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import plugin from './remark-ccm-links.mjs';
import { loadPages } from '../mcp/content.mjs';
import { fileURLToPath } from 'node:url';

const registry = JSON.parse(readFileSync(new URL('../src/data/links.json', import.meta.url), 'utf8'));
const pages = loadPages(fileURLToPath(new URL('../src/content/docs', import.meta.url)));
const run = (md, path = '/x/src/content/docs/overview/foo.md') => String(unified().use(remarkParse).use(plugin).use(remarkStringify).processSync({ value: md, path }));

describe('registry', () => {
  it('every id exists', () => { for (const e of registry) expect(pages.some((p) => p.data.id === e.id), e.id).toBe(true); });
});
describe('remark-ccm-links', () => {
  it('links only the first mention', () => {
    const out = run('The Measured Mile works. A Measured Mile again.');
    expect(out.match(/\]\(/g)).toHaveLength(1);
  });
  it('skips headings and code', () => {
    expect(run('# Measured Mile\n\n`Measured Mile`')).not.toMatch(/\]\(/);
  });
  it('links clause refs', () => { expect(run('See Sub-Clause 3.7 here.')).toMatch(/\[Sub-Clause 3\.7\]\(\/volume-1\//); });
});
