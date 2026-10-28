#!/usr/bin/env node
// One-shot bootstrap: source/ccm-bok-toc.md -> src/content/docs. Never overwrites pages whose
// status is not "stub" unless --force. --check does a dry run and still writes the citation report.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseFile } from './parse.mjs';
import { emit } from './emit.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const args = new Set(process.argv.slice(2));
const data = parseFile(repo + 'source/ccm-bok-toc.md');
const formulas = JSON.parse(readFileSync(repo + 'source/formulas.json', 'utf8'));
const stats = emit(data, formulas, { root: repo + 'src/content/docs', check: args.has('--check'), force: args.has('--force') });

const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
writeFileSync(repo + 'source/citation-review.csv', ['num,title,chosen,candidates', ...stats.review.map((r) => [r.num, q(r.title), r.chosen, q(r.candidates)].join(','))].join('\n') + '\n');
console.log(`${args.has('--check') ? 'would write' : 'wrote'} ${stats.written.length} files; skipped ${stats.skipped.length} (edited); ${stats.review.length} lines need citation review`);
