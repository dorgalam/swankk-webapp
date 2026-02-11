import type { Env } from '../../../../../types/env';

const MAX_SIZE = 25 * 1024 * 1024 // 25 MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let formData: FormData
  try {
    formData = await context.request.formData()
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 })
  }
  const file = formData.get('file')
  const folder = ((formData.get('folder') as string) || '').replace(/\/+$/, '')

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  const type = file.type || ''
  if (!type.startsWith('audio/') && !type.startsWith('image/')) {
    return Response.json({ error: 'Only audio and image files are allowed' }, { status: 400 })
  }

  const sanitized = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
  const key = folder
    ? `${folder}/${Date.now()}-${sanitized}`
    : `${Date.now()}-${sanitized}`

  await context.env.ASSETS_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: type },
  })

  return Response.json({ key, url: `/api/assets/${key}` })
};
