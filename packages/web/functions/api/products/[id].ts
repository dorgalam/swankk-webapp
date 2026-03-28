import type { Env } from '../../../../../types/env';

const JSON_FIELDS = ['images', 'retailers'];

function parseRow(row: Record<string, unknown>): Record<string, unknown> {
  for (const f of JSON_FIELDS) {
    if (typeof row[f] === 'string') {
      try { row[f] = JSON.parse(row[f] as string); } catch { row[f] = []; }
    }
  }
  return row;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;
  const row = await context.env.DB.prepare(`
    SELECT p.*,
      COALESCE(d.name, p.designer_name) AS resolved_designer_name,
      d.slug AS designer_slug,
      t.name AS trend_name,
      t.slug AS trend_slug
    FROM products p
    LEFT JOIN designers d ON p.designer_id = d.id
    LEFT JOIN trends t ON p.trend_id = t.id
    WHERE p.id = ?
  `).bind(id).first() as Record<string, unknown> | null;

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(parseRow(row));
};
