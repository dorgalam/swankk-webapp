import type { Env } from '../../../../../types/env';

interface SimilarRow {
  url_hash:    string;
  url:         string;
  entity_type: string;
  entity_id:   number;
  entity_slug: string;
  role:        string;
  top_styles:  string; // JSON string in D1
  shared_tags: number;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const params = new URL(context.request.url).searchParams;
  const imageUrl = params.get('url');
  const limit    = Math.min(parseInt(params.get('limit') ?? '12', 10), 50);

  if (!imageUrl) {
    return Response.json({ error: 'url parameter is required' }, { status: 400 });
  }

  // Resolve the url_hash from the image URL
  const anchor = await context.env.DB
    .prepare('SELECT url_hash FROM image_tags WHERE url = ?')
    .bind(imageUrl)
    .first<{ url_hash: string }>();

  if (!anchor) {
    return Response.json({ images: [] });
  }

  // Find images that share at least one tag with this image,
  // ranked by number of shared tags descending.
  const { results } = await context.env.DB
    .prepare(`
      SELECT
        it.url_hash, it.url, it.entity_type, it.entity_id,
        it.entity_slug, it.role, it.top_styles,
        COUNT(*) AS shared_tags
      FROM image_tag_items a
      JOIN image_tag_items b ON b.tag = a.tag AND b.url_hash != a.url_hash
      JOIN image_tags it     ON it.url_hash = b.url_hash
      WHERE a.url_hash = ?
      GROUP BY b.url_hash
      ORDER BY shared_tags DESC, it.url_hash
      LIMIT ?
    `)
    .bind(anchor.url_hash, limit)
    .all<SimilarRow>();

  const images = results.map((r) => ({
    ...r,
    top_styles: JSON.parse(r.top_styles ?? '[]') as string[],
  }));

  return Response.json({ images });
};
