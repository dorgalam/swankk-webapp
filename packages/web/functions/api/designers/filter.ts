import type { Env } from '../../../../../types/env';

const JSON_FIELDS = ['known_for_tags', 'eras', 'signature_pieces'];

function parseRow(row: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!row) return row;
  for (const f of JSON_FIELDS) {
    if (typeof row[f] === 'string') {
      try { row[f] = JSON.parse(row[f] as string); } catch { row[f] = []; }
    }
  }
  return row;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return Response.json([]);
  const { results } = await context.env.DB.prepare('SELECT * FROM designers WHERE slug = ?').bind(slug).all();
  return Response.json(results.map(parseRow));
};
