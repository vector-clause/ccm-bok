import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import YAML from 'yaml';

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
});

/** Load every page under `root` as { path, url, data, body }. */
export function loadPages(root) {
  return walk(root).map((file) => {
    const raw = readFileSync(file, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    const data = m ? YAML.parse(m[1]) : {};
    const path = relative(root, file).replace(/\.md$/, '').replace(/(^|\/)index$/, '');
    return { path, url: '/' + (path ? path + '/' : ''), data, body: (m ? m[2] : raw).trim() };
  });
}

const words = (q) => q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);

export function search(pages, query, { volume, limit = 10 } = {}) {
  const ws = words(query);
  return pages
    .filter((p) => !volume || p.data.volume === volume)
    .map((p) => {
      const title = (p.data.title ?? '').toLowerCase(), body = p.body.toLowerCase();
      let score = 0;
      for (const w of ws) { if (title.includes(w)) score += 5; if (body.includes(w)) score += 1; }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p, score }) => summary(p, score));
}

export const summary = (p, score) => ({
  id: p.data.id, title: p.data.title, url: p.url, status: p.data.status, type: p.data.type, ...(score ? { score } : {}),
});

export const getPage = (pages, key) =>
  pages.find((p) => p.data.id === key || p.path === key.replace(/^\/|\/$/g, ''));

/** e.g. prefix "3.2" -> pages whose id starts ccm-3-2- (plus the section index). */
export function listSection(pages, prefix) {
  const id = 'ccm-' + prefix.toLowerCase().replace(/\./g, '-');
  return pages.filter((p) => p.data.id === id || p.data.id?.startsWith(id + '-')).map((p) => summary(p));
}

const CONTRACT_TERMS = { FIDIC: ['fidic'], NEC4: ['nec4', 'nec '], JCT: ['jct'], CMAA: ['cmaa'], AIA: ['aia'] };

/** Pages mentioning the contract family and the topic, with the matching lines. Stub status is surfaced so callers know coverage is thin. */
export function queryClause(pages, contract, topic) {
  const cterms = CONTRACT_TERMS[contract] ?? [contract.toLowerCase()];
  const tws = words(topic);
  const out = [];
  for (const p of pages) {
    const lines = p.body.split('\n').filter((l) => {
      const t = l.toLowerCase();
      return cterms.some((c) => t.includes(c)) && tws.every((w) => t.includes(w));
    });
    const inTitle = cterms.some((c) => (p.data.title ?? '').toLowerCase().includes(c)) && tws.every((w) => (p.data.title ?? '').toLowerCase().includes(w));
    if (lines.length || inTitle) out.push({ ...summary(p), matches: lines.slice(0, 5).map((l) => l.trim().slice(0, 400)) });
  }
  return out;
}
