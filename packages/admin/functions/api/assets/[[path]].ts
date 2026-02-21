import type { Env } from '../../../../../types/env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = (context.params.path as string[]).join('/')

  // Try Cloudflare's CDN edge cache first — skips R2 entirely on cache hit
  const cache = caches.default
  const cacheKey = new Request(context.request.url)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const object = await context.env.ASSETS_BUCKET.get(key)

  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
  if (object.size) {
    headers.set('Content-Length', String(object.size))
  }
  // Long-lived browser cache + CDN edge cache
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  // ETag enables conditional requests (304 Not Modified)
  headers.set('ETag', `"${object.etag}"`)

  const response = new Response(object.body, { headers })

  // Store in CDN edge cache — fire-and-forget, doesn't block the response
  context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
};
