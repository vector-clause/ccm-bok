import { describe, it, expect } from 'vitest';
import { splitCitations } from '../citations.mjs';
import { parseFile } from '../parse.mjs';

describe('splitCitations', () => {
  it('single digit is unambiguous', () => {
    expect(splitCitations('Foundations of Commercial Management1')).toMatchObject({ text: 'Foundations of Commercial Management', sources: [1], ambiguous: false });
  });
  it('two digits are flagged ambiguous, fewest-numbers reading first', () => {
    const r = splitCitations('Something35');
    expect(r.sources).toEqual([35]);
    expect(r.ambiguous).toBe(true);
    expect(r.candidates).toContainEqual([3, 5]);
  });
  it('keeps the title digit in "Sub-Clause 3.738"', () => {
    const r = splitCitations('Determinations under Sub-Clause 3.738');
    expect(r.text).toBe('Determinations under Sub-Clause 3.7');
    expect(r.sources).toEqual([38]);
    expect(r.ambiguous).toBe(true);
  });
  it('rejects splits that cite the same source twice', () => {
    expect(splitCitations('X11').candidates).toEqual([[11]]);
  });
  it('no trailing digits', () => {
    expect(splitCitations('Plain title')).toMatchObject({ sources: [], ambiguous: false });
  });
});

describe('source structure', () => {
  const d = parseFile(new URL('../../../source/ccm-bok-toc.md', import.meta.url).pathname);
  const doms = d.volumes.flatMap((v) => v.domains);
  it('has the expected counts', () => {
    expect(d.volumes).toHaveLength(7);
    expect(doms.filter((x) => !x.isAppendix)).toHaveLength(18);
    expect(doms.filter((x) => x.isAppendix)).toHaveLength(4);
    expect(doms.flatMap((x) => x.sections)).toHaveLength(55);
    expect(doms.flatMap((x) => x.sections.flatMap((s) => s.topics))).toHaveLength(207);
    expect(doms.flatMap((x) => x.items)).toHaveLength(13);
    expect(d.essays).toHaveLength(6);
    expect(d.references).toHaveLength(79);
  });
  it('splits the 3.738 line', () => {
    const t = doms.flatMap((x) => x.sections.flatMap((s) => s.topics)).find((t) => t.num === '3.1.2');
    expect(t.title.endsWith('Sub-Clause 3.7')).toBe(true);
  });
});
