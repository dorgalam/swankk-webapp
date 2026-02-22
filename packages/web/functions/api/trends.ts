import type { Env } from '../../../../types/env';

const JSON_FIELDS = ['designer_slugs', 'preview_images', 'images', 'related_tags'];

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
  const { results } = await context.env.DB.prepare('SELECT * FROM trends ORDER BY name').all();
  return Response.json(results.map(parseRow));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json() as Record<string, any>;
  const { name, slug, context: ctx, designer_slugs, preview_images, images, related_tags } = body;

  const result = await context.env.DB.prepare(
    `INSERT INTO trends (name, slug, context, designer_slugs, preview_images, images, related_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name || '', slug || '', ctx || '',
    JSON.stringify(designer_slugs || []),
    JSON.stringify(preview_images || []),
    JSON.stringify(images || []),
    JSON.stringify(related_tags || [])
  ).run();

  const row = await context.env.DB.prepare('SELECT * FROM trends WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(parseRow(row), { status: 201 });
};
