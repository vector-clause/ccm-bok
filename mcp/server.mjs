#!/usr/bin/env node
// MCP server exposing the CCM-BOK content (read-only). Usage: node mcp/server.mjs [contentDir]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { loadPages, search, getPage, listSection, queryClause } from './content.mjs';

const root = process.argv[2] ?? fileURLToPath(new URL('../src/content/docs', import.meta.url));
const pages = loadPages(root);
const text = (o) => ({ content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o, null, 2) }] });

const server = new McpServer({ name: 'ccm-bok', version: '0.1.0' });

server.tool('search_ccm', 'Full-text search of the CCM-BOK. Most pages are still stubs (status field).',
  { query: z.string(), volume: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']).optional(), limit: z.number().int().min(1).max(50).optional() },
  async ({ query, volume, limit }) => text(search(pages, query, { volume, limit })));

server.tool('get_ccm_page', 'Fetch one page (frontmatter + Markdown) by id (e.g. ccm-10-1-1) or path.',
  { id: z.string() },
  async ({ id }) => { const p = getPage(pages, id); return p ? text({ ...p.data, url: p.url, body: p.body }) : { ...text(`No page for "${id}"`), isError: true }; });

server.tool('list_ccm_section', 'List pages under a section or domain number, e.g. "3.2" or "10".',
  { prefix: z.string().regex(/^[0-9A-Da-d.]+$/) },
  async ({ prefix }) => text(listSection(pages, prefix)));

server.tool('query_ccm_clause', 'Find where a contract family (FIDIC, NEC4, JCT, CMAA, AIA) is discussed for a topic such as "early warning". Returns matching pages and lines; check status before relying on content.',
  { contract: z.enum(['FIDIC', 'NEC4', 'JCT', 'CMAA', 'AIA']), topic: z.string() },
  async ({ contract, topic }) => text(queryClause(pages, contract, topic)));

await server.connect(new StdioServerTransport());
