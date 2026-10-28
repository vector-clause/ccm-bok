import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import YAML from 'yaml';
import { splitCitations } from './citations.mjs';

export const slugify = (title, max = 60) => {
  let s = title.split(':')[0].toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (s.length > max) s = s.slice(0, max).replace(/-[^-]*$/, '');
  return s;
};
const idOf = (num) => 'ccm-' + num.toLowerCase().replace(/\./g, '-');

const STD = [
  [/AACE (\d+R-\d+)/g, (m) => ({ standard: 'AACE International', clause: `RP ${m[1]}` })],
  [/ISO (\d{4,5}(?:-\d+)?)/g, (m) => ({ standard: 'ISO', clause: m[1] })],
  [/PAS (\d{4})/g, (m) => ({ standard: 'PAS', clause: m[1] })],
  [/IFRS (\d+)/g, (m) => ({ standard: 'IFRS', clause: m[1] })],
  [/ASC (\d+)/g, (m) => ({ standard: 'ASC', clause: m[1] })],
  [/\b(NRM [123])\b/g, (m) => ({ standard: 'RICS NRM', clause: m[1] })],
  [/\b(FIDIC|NEC4|JCT|AIA A201|ConsensusDocs|ICMS)\b/g, (m) => ({ standard: m[1] })],
];
export function standardsIn(text) {
  const seen = new Set(), out = [];
  for (const [re, f] of STD) for (const m of text.matchAll(re)) {
    const o = f(m), k = JSON.stringify(o);
    if (!seen.has(k)) { seen.add(k); out.push(o); }
  }
  return out;
}

const refLink = (n) => `[${n}](/references/#ref-${n})`;

/** Turn glued citation digits in prose/table text into superscript reference links. */
export function linkCitations(text, acc) {
  // Glued digits that the generic pattern below cannot see (digits follow a clause number).
  text = text.replace(/(Sub-Clause 3\.7|Clause 20)38(?=\.)/g, (_, c) => { acc.unverified.add(38); return `${c}<sup>${refLink(38)}</sup>`; });
  const re = /(?<=[a-z)\]%])(\d{1,3})(?=[\s.,;:)|]|$)/g;
  text = text.replace(re, (run) => {
    const r = splitCitations('x' + run);
    if (!r.sources.length) return run;
    for (const n of r.sources) (r.ambiguous ? acc.unverified : acc.verified).add(n);
    return `<sup>${r.sources.map(refLink).join(', ')}</sup>`;
  });
  return text;
}

function write(root, rel, fm, body, opts, stats) {
  const path = join(root, rel);
  if (existsSync(path) && !opts.force) {
    const m = readFileSync(path, 'utf8').match(/^status: (\w+)/m);
    if (m && m[1] !== 'stub' && !opts.overwriteNonStub) { stats.skipped.push(rel); return; }
  }
  stats.written.push(rel);
  if (opts.check) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `---\n${YAML.stringify(fm, { lineWidth: 0 }).trimEnd()}\n---\n\n${body.trim()}\n`);
}

const STUB = ':::caution[Stub page]\nThis page is an outline entry taken from the CCM-BOK table of contents. It has no authored content yet. See [CONTRIBUTING](https://github.com/vector-clause/ccm-bok/blob/main/CONTRIBUTING.md) to help write it; cite primary sources.\n:::';

export function emit(data, formulas, { root, check = false, force = false }) {
  const opts = { check, force };
  const stats = { written: [], skipped: [], review: [] };
  const base = { license: 'CC-BY-NC-SA-4.0' };
  const sourcesFm = (it) => ({
    ...(it.sources.length && !it.ambiguous ? { sources: it.sources } : {}),
    ...(it.sources.length && it.ambiguous ? { sources_unverified: it.sources } : {}),
  });
  const note = (it, num) => { if (it.ambiguous) stats.review.push({ num, title: it.title, chosen: it.sources.join('+'), candidates: it.candidates.map((c) => c.join('+')).join(' | ') }); };
  const list = (links) => links.map(([t, h]) => `- [${t}](${h})`).join('\n');

  for (const vol of data.volumes) {
    const vdir = `volume-${vol.n}`;
    write(root, `${vdir}/index.md`, { title: `Volume ${vol.roman}: ${vol.title}`, description: `Volume ${vol.roman} of the CCM-BOK: ${vol.title}.`, id: `ccm-vol-${vol.n}`, volume: vol.roman, type: 'overview', status: 'stub', ...base },
      list(vol.domains.map((d) => [`${d.isAppendix ? 'Appendix' : 'Domain'} ${d.key}: ${d.title}`, `/${vdir}/${d.isAppendix ? 'appendix-' + d.key.toLowerCase() : 'domain-' + d.key}/`])), opts, stats);
    for (const dom of vol.domains) {
      const ddir = `${vdir}/${dom.isAppendix ? 'appendix-' + dom.key.toLowerCase() : 'domain-' + dom.key}`;
      const dlabel = `${dom.isAppendix ? 'Appendix' : 'Domain'} ${dom.key}`;
      const dchildren = dom.isAppendix
        ? dom.items.map((i) => [`${i.num} ${i.title}`, `/${ddir}/${i.num.toLowerCase().replace('.', '-')}-${slugify(i.title)}/`])
        : dom.sections.map((s) => [`${s.num} ${s.title}`, `/${ddir}/${s.num.replace('.', '-')}-${slugify(s.title)}/`]);
      write(root, `${ddir}/index.md`, { title: `${dlabel}: ${dom.title}`, description: `${dlabel} of Volume ${vol.roman}: ${dom.title}.`, id: `ccm-${dlabel.toLowerCase().replace(' ', '-')}`, volume: vol.roman, domain: dom.key, type: 'overview', status: 'stub', ...base }, list(dchildren), opts, stats);

      const emitItem = (it, dirRel, extra = {}) => {
        note(it, it.num);
        const colon = it.title.indexOf(':');
        const scope = colon > -1 ? it.title.slice(colon + 1).trim() : '';
        const fm = {
          title: it.title,
          description: `${it.title} (${dlabel}: ${dom.title}).`,
          id: idOf(it.num), volume: vol.roman, domain: dom.key, ...extra,
          type: dom.isAppendix && /^D\./.test(it.num) ? 'lexicon' : dom.isAppendix && /^C\./.test(it.num) ? 'register' : 'concept',
          status: 'stub', summary: it.title,
          ...(standardsIn(it.title).length ? { standards_referenced: standardsIn(it.title) } : {}),
          ...sourcesFm(it), ...base,
        };
        return { fm, scope };
      };

      if (dom.isAppendix) {
        for (const it of dom.items) {
          const { fm, scope } = emitItem(it);
          const f = formulas && FORMULA_PAGES[it.num];
          if (f) fm.key_formula = f.key(formulas);
          const body = [STUB, scope ? `## Scope as outlined\n\n${scope}` : `## Scope as outlined\n\n${it.title}`, f ? f.body(formulas) : ''].join('\n\n');
          write(root, `${ddir}/${it.num.toLowerCase().replace('.', '-')}-${slugify(it.title)}.md`, fm, body, opts, stats);
        }
        continue;
      }
      for (const sec of dom.sections) {
        note(sec, sec.num);
        const sdir = `${ddir}/${sec.num.replace('.', '-')}-${slugify(sec.title)}`;
        write(root, `${sdir}/index.md`, { title: `${sec.num} ${sec.title}`, description: `${sec.title} (${dlabel}: ${dom.title}).`, id: idOf(sec.num), volume: vol.roman, domain: dom.key, section: sec.num, type: 'overview', status: 'stub', ...sourcesFm(sec), ...base },
          list(sec.topics.map((t) => [`${t.num} ${t.title}`, `/${sdir}/${t.num.replace(/\./g, '-')}-${slugify(t.title)}/`])), opts, stats);
        for (const t of sec.topics) {
          const { fm, scope } = emitItem(t, sdir, { section: sec.num });
          const body = [STUB, `## Scope as outlined\n\n${scope || t.title}`, `Part of [${sec.num} ${sec.title}](/${sdir}/).`].join('\n\n');
          write(root, `${sdir}/${t.num.replace(/\./g, '-')}-${slugify(t.title)}.md`, fm, body, opts, stats);
        }
      }
    }
  }

  // Overview pages: introduction + essays
  const overview = (slug, title, md, type, order) => {
    const acc = { verified: new Set(), unverified: new Set() };
    const body = linkCitations(md, acc);
    write(root, `overview/${slug}.md`, { title, description: title, id: `ccm-overview-${slug}`, type, status: 'draft', sidebar: { order }, ...(acc.verified.size ? { sources: [...acc.verified].sort((a, b) => a - b) } : {}), ...(acc.unverified.size ? { sources_unverified: [...acc.unverified].sort((a, b) => a - b) } : {}), ...base },
      `:::note[Draft provenance]\nSynthesised text carried over from the source outline; citation numbers link to [References](/references/) and have not been verified.\n:::\n\n${body}`, { ...opts, overwriteNonStub: false }, stats);
  };
  overview('introduction', 'Institutional architecture and cross-standard harmonization', swapImages(data.intro, formulas), 'overview', 1);
  const types = { 0: 'comparison', 1: 'comparison' };
  data.essays.forEach((e, i) => overview(slugify(e.title), e.title, swapImages(e.body, formulas) + (/Formulation|Mathematical/.test(e.body) ? '\n\n:::caution[Formulae need verification]\nThe formula images in the source were truncated. Entries were completed from the standard textbook form; verify against the SCL Protocol, AACE 25R-03 and the original case law before relying on them.\n:::' : ''), types[i] ?? 'concept', i + 2));

  // References
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const refsBody = ':::caution[Provenance, not authority]\nThese 79 sources were used to draft the original outline. Many are secondary or non-authoritative (vendor blogs, job boards, document-sharing sites). Treat them as leads, and replace them with primary sources (standards, statutes, reported cases) before a page leaves `stub` status.\n:::\n\n<ol>\n'
    + data.references.map((r) => `<li id="ref-${r.n}">${r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title)}</li>`).join('\n') + '\n</ol>';
  write(root, 'references.md', { title: 'References', description: 'Sources consulted for the CCM-BOK outline.', id: 'ccm-references', type: 'overview', status: 'draft', ...base }, refsBody, opts, stats);
  return stats;
}

const F = (f) => `$$\n${f}\n$$`;
const FORMULA_PAGES = {
  'B.2': { key: (f) => f.eichleay.steps[2], body: (f) => ['### Hudson', F(f.hudson.latex), '### Emden', F(f.emden.latex), '### Eichleay', f.eichleay.steps.map(F).join('\n\n'), ':::caution[Verify]\nCompleted from standard forms; the source images were truncated.\n:::'].join('\n\n') },
  'B.3': { key: (f) => f['measured-mile'].latex, body: (f) => [F(f['measured-mile'].latex), ':::caution[Verify]\nCompleted from the visible part of a truncated source image.\n:::'].join('\n\n') },
};

function swapImages(md, f) {
  if (!f) return md;
  const inline = { 2: 'V_E', 3: 'C_A', 4: '\\mathrm{Adj}_{AP}', 5: '\\mathrm{Adj}_{WIP}' };
  const m = { 1: null, 6: f['measured-mile'].latex, 7: f['modified-total-cost'].latex, 8: f.hudson.latex, 9: f.emden.latex };
  return md
    .replace(/^!\[\]\[image1\]\s*$/m, F(f.cvr.latex))
    .replace(/!\[\]\[image([2-5])\]/g, (_, n) => `$${inline[n]}$`)
    .replace(/!\[\]\[image(6|7|8|9)\]/g, (_, n) => `$${m[n]}$`)
    .replace(/!\[\]\[image10\]\s*!\[\]\[image11\]\s*!\[\]\[image12\]/, f.eichleay.steps.map((s) => `$${s}$`).join(' '));
}
