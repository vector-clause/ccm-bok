import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const font = (w: number) => readFileSync(new URL(`../../../node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff`, import.meta.url));
const fonts = [
  { name: 'Inter', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font(700), weight: 700 as const, style: 'normal' as const },
];

export const getStaticPaths = (async () => {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

const el = (type: string, style: Record<string, unknown>, children: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: { data: Record<string, any> } };
  const d = entry.data;
  const label = [d.volume ? `Volume ${d.volume}` : 'Body of Knowledge', d.status === 'stub' ? 'Outline' : null].filter(Boolean).join(' · ');
  const title = String(d.title).length > 120 ? String(d.title).slice(0, 117) + '…' : String(d.title);
  const svg = await satori(
    el('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 72, boxSizing: 'border-box', background: '#0f1b2d', color: '#fff', fontFamily: 'Inter' }, [
      el('div', { fontSize: 30, color: '#f0b429', fontWeight: 700 }, label),
      el('div', { fontSize: title.length > 70 ? 52 : 64, fontWeight: 700, lineHeight: 1.15 }, title),
      el('div', { display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#9fb3c8' }, [
        el('div', {}, 'CCM-BOK · Construction Commercial Management'),
        el('div', { flexShrink: 0, marginLeft: 24 }, 'CC BY-NC-SA 4.0'),
      ]),
    ]) as any,
    { width: 1200, height: 630, fonts },
  );
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
