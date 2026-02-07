export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const ownerEmail = url.searchParams.get('owner_email');
  if (!ownerEmail) return Response.json([]);
  const { results } = await context.env.DB.prepare('SELECT * FROM collections WHERE owner_email = ? ORDER BY created_at DESC').bind(ownerEmail).all();
  return Response.json(results);
}

export async function onRequestPost(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json();
  const { name, owner_email } = body;
  const result = await context.env.DB.prepare(
    'INSERT INTO collections (name, owner_email) VALUES (?, ?)'
  ).bind(name || '', owner_email || user.email).run();

  const row = await context.env.DB.prepare('SELECT * FROM collections WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(row, { status: 201 });
}
