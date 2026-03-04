import type { Env } from '../../../../types/env';

// Edge cache: 2 min at Cloudflare, 30s browser. Invalidated on next deploy.
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=30, s-maxage=120' };

const JSON_FIELDS = ['known_for_tags', 'eras', 'signature_pieces', 'related_tags'];

function parseRow(row: Record<string, unknown>): Record<string, unknown> {
  for (const f of JSON_FIELDS) {
    if (typeof row[f] === 'string') {
      try { row[f] = JSON.parse(row[f] as string); } catch { row[f] = []; }
    }
  }
  return row;
}

/** Trim heavy fields for list responses — detail views use /filter?slug= */
function trimForList(row: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(row.eras)) {
    row.eras = (row.eras as any[]).map((era) => ({
      ...era,
      images: (era.images ?? []).slice(0, 8),
    }));
  }
  if (Array.isArray(row.signature_pieces)) {
    row.signature_pieces = (row.signature_pieces as any[]).slice(0, 4);
  }
  return row;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB
    .prepare('SELECT * FROM designers ORDER BY name')
    .all();
  const data = results.map((r) => trimForList(parseRow(r as Record<string, unknown>)));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...CACHE_HEADERS },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as { user: { sub: number; email: string } | null }).user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json() as Record<string, any>;
  const { name, slug, phonetic, audio_url, origin_meaning, hero_image_url, founder, founded_year, origin_location, creative_director, known_for_tags, eras, signature_pieces, related_tags } = body;

  const result = await context.env.DB.prepare(
    `INSERT INTO designers (name, slug, phonetic, audio_url, origin_meaning, hero_image_url, founder, founded_year, origin_location, creative_director, known_for_tags, eras, signature_pieces, related_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name || '', slug || '', phonetic || '', audio_url || '', origin_meaning || '',
    hero_image_url || '', founder || '', founded_year || '', origin_location || '',
    creative_director || '',
    JSON.stringify(known_for_tags || []),
    JSON.stringify(eras || []),
    JSON.stringify(signature_pieces || []),
    JSON.stringify(related_tags || [])
  ).run();

  const row = await context.env.DB.prepare('SELECT * FROM designers WHERE id = ?').bind(result.meta.last_row_id).first() as Record<string, unknown>;
  return Response.json(parseRow(row), { status: 201 });
};
