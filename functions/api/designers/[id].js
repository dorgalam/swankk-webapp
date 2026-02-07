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

export async function onRequestPut(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  const body = await context.request.json();
  const fields = [];
  const values = [];
  const allowed = ['name', 'slug', 'phonetic', 'audio_url', 'origin_meaning', 'hero_image_url', 'founder', 'founded_year', 'origin_location', 'creative_director', 'known_for_tags', 'eras', 'signature_pieces'];

  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = ?`);
      values.push(JSON_FIELDS.includes(key) ? JSON.stringify(body[key]) : (body[key] ?? ''));
    }
  }

  if (fields.length === 0) return Response.json({ error: 'No fields to update' }, { status: 400 });

  fields.push("updated_at = datetime('now')");
  values.push(id);
  await context.env.DB.prepare(`UPDATE designers SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

  const row = await context.env.DB.prepare('SELECT * FROM designers WHERE id = ?').bind(id).first();
  return Response.json(parseRow(row));
}

export async function onRequestDelete(context) {
  const user = context.data?.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  await context.env.DB.prepare('DELETE FROM designers WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}
