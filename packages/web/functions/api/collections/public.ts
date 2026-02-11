import type { Env } from '../../../../../types/env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const shareId = url.searchParams.get('share_id');
  if (!shareId) return Response.json([]);
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM collections WHERE share_id = ? AND is_public = 1'
  ).bind(shareId).all();
  return Response.json(results);
};
