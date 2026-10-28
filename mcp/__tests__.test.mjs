import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { loadPages, search, getPage, listSection, queryClause } from './content.mjs';

const pages = loadPages(fileURLToPath(new URL('../src/content/docs', import.meta.url)));
describe('mcp content', () => {
  it('loads all pages', () => expect(pages.length).toBeGreaterThan(300));
  it('searches', () => expect(search(pages, 'measured mile')[0].title).toMatch(/Measured Mile/));
  it('gets by id', () => expect(getPage(pages, 'ccm-9-1-1').data.title).toMatch(/Categorizing/));
  it('lists a section', () => expect(listSection(pages, '3.2').length).toBeGreaterThan(3));
  it('queries clauses', () => expect(queryClause(pages, 'NEC4', 'early warning').length).toBeGreaterThan(0));
});
