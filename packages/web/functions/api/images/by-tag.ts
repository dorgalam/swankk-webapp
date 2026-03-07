import type { Env } from '../../../../../types/env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const params = new URL(context.request.url).searchParams;
  const tag   = params.get('tag');
  const limit = Math.min(parseInt(params.get('limit') ?? '24', 10), 50);

  if (!tag) return Response.json({ images: [] });

  const { results } = await context.env.DB
    .prepare(`
      SELECT it.url_hash, it.url, it.entity_type, it.entity_slug
      FROM image_tag_items iti
      JOIN image_tags it ON it.url_hash = iti.url_hash
      WHERE lower(iti.tag) = lower(?)
      ORDER BY it.tagged_at DESC
      LIMIT ?
    `)
    .bind(tag, limit)
    .all<{ url_hash: string; url: string; entity_type: string; entity_slug: string }>();

  return Response.json({ images: results });
};
