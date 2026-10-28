import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { visit, SKIP } from 'unist-util-visit';
import { loadPages } from '../mcp/content.mjs';

const root = fileURLToPath(new URL('../src/content/docs', import.meta.url));
const registry = JSON.parse(readFileSync(new URL('../src/data/links.json', import.meta.url), 'utf8'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SKIP_TYPES = new Set(['link', 'linkReference', 'heading', 'inlineCode', 'code', 'math', 'inlineMath', 'html', 'mdxJsxFlowElement']);

let urlById;
const urls = () => (urlById ??= new Map(loadPages(root).map((p) => [p.data.id, p.url])));

/** Link the first mention of each registered term/clause per page to the page that covers it. */
export default function remarkCcmLinks() {
  return (tree, file) => {
    const here = '/' + String(file.path ?? '').replace(/^.*src\/content\/docs\//, '').replace(/\.md$/, '').replace(/(^|\/)index$/, '').replace(/\/?$/, '/');
    const done = new Set();
    for (const entry of registry) {
      const href = urls().get(entry.id);
      if (!href || href === here || here.startsWith(href)) continue;
      const re = new RegExp(`(?<![\\w-])(${entry.match.map(esc).join('|')})(?![\\w-])`);
      visit(tree, (node, index, parent) => {
        if (done.has(entry.id)) return SKIP;
        if (SKIP_TYPES.has(node.type)) return SKIP;
        if (node.type !== 'text') return;
        const m = re.exec(node.value);
        if (!m) return;
        const before = node.value.slice(0, m.index), after = node.value.slice(m.index + m[0].length);
        parent.children.splice(index, 1,
          ...(before ? [{ type: 'text', value: before }] : []),
          { type: 'link', url: href, children: [{ type: 'text', value: m[0] }] },
          ...(after ? [{ type: 'text', value: after }] : []));
        done.add(entry.id);
        return [SKIP, index + 3];
      });
    }
  };
}
