import type { Env } from '../../../../../types/env';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  await context.env.DB.prepare('DELETE FROM saved_items WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
};
