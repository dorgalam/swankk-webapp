import type { Env } from '../../../../types/env';

function parseRow(row: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!row) return row;
  if (typeof row.related_tags === 'string') {
    try { row.related_tags = JSON.parse(row.related_tags); } catch { row.related_tags = []; }
  }
  return row;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    'SELECT id, name, slug, description, related_tags FROM styles ORDER BY name'
  ).all();
  return Response.json(results.map(parseRow));
};
