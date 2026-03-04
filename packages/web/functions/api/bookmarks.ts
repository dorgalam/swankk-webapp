import type { Env, CFData } from '../../../../types/env';

function getUser(context: EventContext<Env, string, CFData>) {
  return (context.data as CFData).user ?? null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = getUser(context);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const category = new URL(context.request.url).searchParams.get('category');
  const where = category ? 'AND category = ?' : '';
  const params: unknown[] = category ? [user.sub, category] : [user.sub];

  const { results } = await context.env.DB
    .prepare(`SELECT category, item_id, data, saved_at FROM bookmarks WHERE user_id = ? ${where} ORDER BY saved_at DESC`)
    .bind(...params)
    .all();

  const items = results.map((r: any) => ({
    ...(JSON.parse(r.data as string || '{}')),
    id: r.item_id,
    _category: r.category,
    savedAt: r.saved_at,
  }));

  return Response.json({ items });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = getUser(context);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { category, item_id, data } = await context.request.json() as {
    category: string;
    item_id: string;
    data: Record<string, unknown>;
  };

  if (!category || !item_id) {
    return Response.json({ error: 'category and item_id required' }, { status: 400 });
  }

  await context.env.DB
    .prepare(`INSERT OR REPLACE INTO bookmarks (user_id, category, item_id, data, saved_at)
              VALUES (?, ?, ?, ?, datetime('now'))`)
    .bind(user.sub, category, item_id, JSON.stringify(data ?? {}))
    .run();

  return Response.json({ ok: true }, { status: 201 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = getUser(context);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URL(context.request.url).searchParams;
  const category = params.get('category');
  const item_id = params.get('item_id');

  if (!category || !item_id) {
    return Response.json({ error: 'category and item_id required' }, { status: 400 });
  }

  await context.env.DB
    .prepare('DELETE FROM bookmarks WHERE user_id = ? AND category = ? AND item_id = ?')
    .bind(user.sub, category, item_id)
    .run();

  return Response.json({ ok: true });
};
