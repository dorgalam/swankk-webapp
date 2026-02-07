export async function onRequestGet(context) {
  const user = context.data?.user;
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const row = await context.env.DB.prepare('SELECT id, email, full_name FROM users WHERE id = ?').bind(user.sub).first();
  if (!row) {
    return Response.json({ error: 'User not found' }, { status: 401 });
  }
  return Response.json(row);
}
