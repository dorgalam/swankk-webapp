import type { Env } from '../../../../types/env';

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=30, s-maxage=120' };

const JSON_FIELDS = ['images', 'products', 'related_tags'];

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
  const { results } = await context.env.DB.prepare('SELECT * FROM colors ORDER BY name').all();
  return new Response(JSON.stringify(results.map(parseRow)), {
    headers: { 'Content-Type': 'application/json', ...CACHE_HEADERS },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json() as Record<string, any>;
  const { name, slug, hex, description, main_image_url, images, products, related_tags } = body;

  const result = await context.env.DB.prepare(
    `INSERT INTO colors (name, slug, hex, description, main_image_url, images, products, related_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name || '', slug || '', hex || '', description || '', main_image_url || '',
    JSON.stringify(images || []),
    JSON.stringify(products || []),
    JSON.stringify(related_tags || [])
  ).run();

  const row = await context.env.DB.prepare('SELECT * FROM colors WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(parseRow(row), { status: 201 });
};
