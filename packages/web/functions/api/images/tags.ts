import type { Env } from '../../../../../types/env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url).searchParams.get('url');
  if (!url) return Response.json({ tags: [] });

  const row = await context.env.DB
    .prepare('SELECT top_styles FROM image_tags WHERE url = ?')
    .bind(url)
    .first<{ top_styles: string }>();

  if (!row) return Response.json({ tags: [] });

  return Response.json({ tags: JSON.parse(row.top_styles ?? '[]') as string[] });
};
