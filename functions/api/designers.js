const JSON_FIELDS = ['known_for_tags', 'eras', 'signature_pieces'];

function parseRow(row) {
  if (!row) return row;
  for (const f of JSON_FIELDS) {
    if (typeof row[f] === 'string') {
      try { row[f] = JSON.parse(row[f]); } catch { row[f] = []; }
    }
  }
  return row;
}

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare('SELECT * FROM designers ORDER BY name').all();
  return Response.json(results.map(parseRow));
}

export async function onRequestPost(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await context.request.json();
  const { name, slug, phonetic, audio_url, origin_meaning, hero_image_url, founder, founded_year, origin_location, creative_director, known_for_tags, eras, signature_pieces } = body;

  const result = await context.env.DB.prepare(
    `INSERT INTO designers (name, slug, phonetic, audio_url, origin_meaning, hero_image_url, founder, founded_year, origin_location, creative_director, known_for_tags, eras, signature_pieces)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name || '', slug || '', phonetic || '', audio_url || '', origin_meaning || '',
    hero_image_url || '', founder || '', founded_year || '', origin_location || '',
    creative_director || '',
    JSON.stringify(known_for_tags || []),
    JSON.stringify(eras || []),
    JSON.stringify(signature_pieces || [])
  ).run();

  const row = await context.env.DB.prepare('SELECT * FROM designers WHERE id = ?').bind(result.meta.last_row_id).first();
  return Response.json(parseRow(row), { status: 201 });
}
