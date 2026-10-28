import { readFileSync } from 'node:fs';
import { splitCitations } from './citations.mjs';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function clean(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/(?<!\w)\*(?!\s)([^*]+)\*/g, '$1')
    .replace(/\\([\\`*_{}\[\]()#+\-.!$|<>~&])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function item(raw) {
  const r = splitCitations(clean(raw));
  return { title: r.text.trim(), sources: r.sources, ambiguous: r.ambiguous, candidates: r.candidates };
}

export function parse(md) {
  const lines = md.split('\n').filter((l) => !/^\[image\d+\]:/.test(l));
  const out = { volumes: [], essays: [], references: [], intro: [], institutions: null };
  let vol = null, dom = null, sec = null, essay = null, mode = 'intro', tableBuf = null;

  const flushEssay = () => { if (essay) { essay.body = essay.lines.join('\n').trim(); delete essay.lines; out.essays.push(essay); essay = null; } };

  for (const line of lines) {
    let m;
    if ((m = line.match(/^## \*\*(.+?)\*\*\s*$/))) {
      flushEssay();
      const t = clean(m[1]);
      if (/^Institutional Architecture/.test(t)) { mode = 'intro'; continue; }
      if (/^Detailed Table of Contents/.test(t)) { mode = 'toc'; continue; }
      mode = 'essay';
      essay = { title: t, lines: [] };
      continue;
    }
    if ((m = line.match(/^#### \*\*Works cited\*\*/))) { flushEssay(); mode = 'refs'; continue; }
    if (mode === 'refs') {
      if ((m = line.match(/^> (\d+)\. (.*?)\s*$/))) {
        const n = Number(m[1]);
        const um = m[2].match(/^(.*?),?\s*\[(https?[^\]]*)\]\((.*)\)$/s);
        const title = clean(um ? um[1] : m[2]);
        const url = um ? um[3].replace(/\\([()])/g, '$1') : '';
        out.references.push({ n, title, url });
      }
      continue;
    }
    if (mode === 'intro') { out.intro.push(line); continue; }
    if (mode === 'essay') { essay.lines.push(line); continue; }

    // mode === 'toc'
    if ((m = line.match(/^### \*\*Volume ([IVX]+): (.+?)\*\*/))) {
      vol = { roman: m[1], n: ROMAN.indexOf(m[1]) + 1, title: clean(m[2]), domains: [] };
      out.volumes.push(vol); dom = sec = null; continue;
    }
    if ((m = line.match(/^#### \*\*(Domain (\d+)|Appendix ([A-D])): (.+?)\*\*/))) {
      dom = { key: m[2] ?? m[3], isAppendix: !!m[3], title: clean(m[4]), sections: [], items: [] };
      vol.domains.push(dom); sec = null; continue;
    }
    if ((m = line.match(/^\* (\d+\.\d+|[A-D]\.\d+) (.+?)\s*$/))) {
      const it = { num: m[1], ...item(m[2]), topics: [] };
      if (dom.isAppendix) dom.items.push(it); else { dom.sections.push(it); sec = it; }
      continue;
    }
    if ((m = line.match(/^\s+\* (\d+\.\d+\.\d+) (.+?)\s*$/))) {
      sec.topics.push({ num: m[1], ...item(m[2]) });
      continue;
    }
  }
  flushEssay();
  out.intro = out.intro.join('\n').trim();
  return out;
}

export const parseFile = (p) => parse(readFileSync(p, 'utf8'));
