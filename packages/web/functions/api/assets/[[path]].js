export async function onRequestGet(context) {
  const key = context.params.path.join('/')
  const object = await context.env.ASSETS_BUCKET.get(key)

  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
  if (object.size) {
    headers.set('Content-Length', object.size)
  }
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
}
