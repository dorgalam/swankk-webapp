import type { Env } from '../../../../types/env';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as { designer_name?: string; email?: string };
  const { designer_name, email } = body;

  if (!designer_name) {
    return Response.json({ error: 'designer_name is required' }, { status: 400 });
  }

  const result = await context.env.DB.prepare(
    'INSERT INTO designer_requests (designer_name, email) VALUES (?, ?)'
  ).bind(designer_name, email || '').run();

  const row = await context.env.DB.prepare('SELECT * FROM designer_requests WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(row, { status: 201 });
};
