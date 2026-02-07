export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'swankk_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
}
