// Citation numbers are glued onto the end of source text ("...Sub-Clause 3.738").
// Split a trailing digit run into valid reference numbers (1..MAX_REF).

export const MAX_REF = 79;

function splits(digits) {
  if (!digits) return [[]];
  const out = [];
  for (const len of [1, 2]) {
    if (digits.length < len) continue;
    const head = digits.slice(0, len);
    if (head[0] === '0') continue;
    const n = Number(head);
    if (n < 1 || n > MAX_REF) continue;
    for (const rest of splits(digits.slice(len))) out.push([n, ...rest]);
  }
  return out;
}

/**
 * @returns {{ text: string, sources: number[], ambiguous: boolean, candidates: number[][] }}
 * `sources` is the fewest-numbers split; `ambiguous` is true when other splits
 * (or other title/citation boundaries, e.g. "3.738") are also valid.
 */
export function splitCitations(raw) {
  const m = raw.match(/^(.*?)(\d+)$/s);
  if (!m) return { text: raw, sources: [], ambiguous: false, candidates: [] };
  const [, head, run] = m;
  const dotted = /\d\.$/.test(head); // "3." + "738": leading digit(s) belong to the title
  const candidates = [];
  const minKeep = dotted ? 1 : 0;
  for (let keep = minKeep; keep < run.length; keep++) {
    if (!dotted && keep > 0) break;
    if (dotted && keep > 1) break;
    for (const s of splits(run.slice(keep))) candidates.push({ keep, s });
  }
  for (let i = candidates.length - 1; i >= 0; i--) if (new Set(candidates[i].s).size !== candidates[i].s.length) candidates.splice(i, 1);
  if (!candidates.length) return { text: raw, sources: [], ambiguous: true, candidates: [] };
  candidates.sort((a, b) => a.s.length - b.s.length);
  const best = candidates[0];
  const text = head + run.slice(0, best.keep);
  const ambiguous = candidates.length > 1 || dotted;
  return { text, sources: best.s, ambiguous, candidates: candidates.map((c) => c.s) };
}
