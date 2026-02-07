const JWT_SECRET_KEY = 'SWANKK_JWT_SECRET';
const SITE_SECRET_KEY = 'SITE_SECRET';

// ── Access gate ─────────────────────────────────────────────
// If SITE_SECRET is set, every request must prove it knows the secret.
// First visit: ?access=<secret> → sets cookie, redirects to clean URL.
// Subsequent visits: cookie is enough.
// If SITE_SECRET is not set, the gate is disabled (local dev).

function checkAccess(request, env) {
  const secret = env[SITE_SECRET_KEY];
  if (!secret) return { allowed: true };

  const url = new URL(request.url);

  // Check query param
  if (url.searchParams.get('access') === secret) {
    // Set cookie and redirect to clean URL
    url.searchParams.delete('access');
    return {
      allowed: false,
      redirect: new Response(null, {
        status: 302,
        headers: {
          'Location': url.pathname + url.search + url.hash,
          'Set-Cookie': `swankk_gate=${secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`,
        },
      }),
    };
  }

  // Check cookie
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)swankk_gate=([^;]+)/);
  if (match && match[1] === secret) {
    return { allowed: true };
  }

  return { allowed: false };
}

// ── JWT auth (unchanged) ────────────────────────────────────

async function getKey(env) {
  const secret = env[JWT_SECRET_KEY] || 'dev-secret-change-in-production';
  const enc = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token, env) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const key = await getKey(env);
  const data = new TextEncoder().encode(parts[0] + '.' + parts[1]);
  const sig = base64UrlDecode(parts[2]);
  const valid = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!valid) return null;
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return payload;
}

// ── Main middleware ─────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;

  // Access gate
  const access = checkAccess(request, env);
  if (!access.allowed) {
    if (access.redirect) return access.redirect;
    return new Response('Not found', { status: 404 });
  }

  // JWT session
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)swankk_session=([^;]+)/);
  let user = null;
  if (match) {
    user = await verifyJWT(match[1], env);
  }
  context.data = { user };
  return context.next();
}
