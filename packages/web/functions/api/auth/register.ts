import type { Env } from '../../../../../types/env';

const JWT_SECRET_KEY = 'SWANKK_JWT_SECRET';

async function getKey(env: Env): Promise<CryptoKey> {
  const secret = env[JWT_SECRET_KEY] || 'dev-secret-change-in-production';
  const enc = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function base64UrlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJWT(payload: Record<string, unknown>, env: Env): Promise<string> {
  const key = await getKey(env);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const data = new TextEncoder().encode(header + '.' + body);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return header + '.' + body + '.' + base64UrlEncode(sig);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
  return saltHex + ':' + hashHex;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const { email, password, full_name } = await request.json() as { email: string; password: string; full_name?: string };
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const result = await env.DB.prepare(
      'INSERT INTO users (email, full_name, password) VALUES (?, ?, ?)'
    ).bind(email.toLowerCase(), full_name || '', hashed).run();

    const userId = result.meta.last_row_id;
    const token = await signJWT({ sub: userId, email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, env);

    return new Response(JSON.stringify({ id: userId, email: email.toLowerCase(), full_name: full_name || '' }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `swankk_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
      },
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
};
