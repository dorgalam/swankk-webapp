export async function onRequestPost(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await context.request.json();
  if (!Array.isArray(items)) return Response.json({ error: 'Expected array' }, { status: 400 });

  const created = [];
  for (const item of items) {
    const result = await context.env.DB.prepare(
      'INSERT INTO collections (name, owner_email) VALUES (?, ?)'
    ).bind(item.name || '', item.owner_email || user.email).run();
    const row = await context.env.DB.prepare('SELECT * FROM collections WHERE id = ?').bind(result.meta.last_row_id).first();
    created.push(row);
  }

  return Response.json(created, { status: 201 });
}
