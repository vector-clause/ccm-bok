import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import YAML from 'yaml';

export const getStaticPaths = (async () => {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: { data: Record<string, unknown>; body?: string } };
  const fm = YAML.stringify(entry.data, { lineWidth: 0 }).trimEnd();
  return new Response(`---\n${fm}\n---\n\n${entry.body ?? ''}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
