import type { Env } from '../../../../../types/env';

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'swankk_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
};
