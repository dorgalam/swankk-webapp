import type { Env } from '../../../../../types/env';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  const body = await context.request.json() as Record<string, unknown>;
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of ['name', 'is_public', 'share_id']) {
    if (key in body) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (fields.length === 0) return Response.json({ error: 'No fields to update' }, { status: 400 });
  values.push(id);

  await context.env.DB.prepare(`UPDATE collections SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare('SELECT * FROM collections WHERE id = ?').bind(id).first();
  return Response.json(row);
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  // saved_items cascade via FK, but D1 needs PRAGMA foreign_keys = ON
  await context.env.DB.prepare('DELETE FROM saved_items WHERE collection_id = ?').bind(id).run();
  await context.env.DB.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
};
