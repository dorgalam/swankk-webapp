export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const collectionId = url.searchParams.get('collection_id');
  if (!collectionId) return Response.json([]);
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM saved_items WHERE collection_id = ? ORDER BY created_at DESC'
  ).bind(collectionId).all();
  return Response.json(results);
}

export async function onRequestPost(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json();
  const { collection_id, owner_email, item_type, designer_id, title, image_url, subtitle, external_url } = body;

  const result = await context.env.DB.prepare(
    `INSERT INTO saved_items (collection_id, owner_email, item_type, designer_id, title, image_url, subtitle, external_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    collection_id, owner_email || user.email, item_type || '', designer_id || null,
    title || '', image_url || '', subtitle || '', external_url || ''
  ).run();

  const row = await context.env.DB.prepare('SELECT * FROM saved_items WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(row, { status: 201 });
}
