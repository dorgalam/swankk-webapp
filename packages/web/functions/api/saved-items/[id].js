export async function onRequestDelete(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  await context.env.DB.prepare('DELETE FROM saved_items WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}
