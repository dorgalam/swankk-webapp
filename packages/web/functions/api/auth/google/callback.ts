import type { Env } from '../../../../../../types/env';

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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;
  const homeUrl = `${origin}/Home`;
  const loginUrl = `${origin}/Login?error=google_failed`;

  if (!code) return Response.redirect(loginUrl, 302);

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return Response.redirect(loginUrl, 302);

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) return Response.redirect(loginUrl, 302);
    const tokens = await tokenRes.json() as { access_token: string };

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) return Response.redirect(loginUrl, 302);
    const googleUser = await userRes.json() as { id: string; email: string; name: string };

    const email = googleUser.email.toLowerCase();

    // Find or create user
    let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) {
      await env.DB.prepare(
        "INSERT INTO users (email, full_name, password, created_at) VALUES (?, ?, '', datetime('now'))",
      ).bind(email, googleUser.name || email).run();
      user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    }

    if (!user) return Response.redirect(loginUrl, 302);

    const token = await signJWT(
      { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 },
      env,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: homeUrl,
        'Set-Cookie': `swankk_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
      },
    });
  } catch {
    return Response.redirect(loginUrl, 302);
  }
};
