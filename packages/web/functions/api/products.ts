import type { Env } from '../../../../types/env';

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
  const url = new URL(context.request.url);
  const designer_id = url.searchParams.get('designer_id');
  const trend_id = url.searchParams.get('trend_id');
  const section = url.searchParams.get('section');
  const slug = url.searchParams.get('slug');

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (designer_id) { conditions.push('p.designer_id = ?'); params.push(Number(designer_id)); }
  if (trend_id)    { conditions.push('p.trend_id = ?');    params.push(Number(trend_id)); }
  if (section)     { conditions.push('p.section = ?');     params.push(section); }
  if (slug)        { conditions.push('p.slug = ?');        params.push(slug); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const sql = `
    SELECT p.*,
      COALESCE(d.name, p.designer_name) AS resolved_designer_name,
      d.slug AS designer_slug,
      t.name AS trend_name,
      t.slug AS trend_slug
    FROM products p
    LEFT JOIN designers d ON p.designer_id = d.id
    LEFT JOIN trends t ON p.trend_id = t.id
    ${where}
    ORDER BY p.created_at DESC
  `;

  const stmt = context.env.DB.prepare(sql);
  const { results } = params.length ? await stmt.bind(...params).all() : await stmt.all();
  return Response.json((results as Record<string, unknown>[]).map(parseRow));
};
