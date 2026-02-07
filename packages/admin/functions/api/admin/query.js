const ALLOWED = /^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i;
const BLOCKED = /\b(DROP|ALTER|CREATE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b/i;

export async function onRequestPost(context) {
  try {
    const { sql, params } = await context.request.json();

    if (!sql || typeof sql !== 'string') {
      return Response.json({ error: 'sql is required' }, { status: 400 });
    }

    if (!ALLOWED.test(sql) || BLOCKED.test(sql)) {
      return Response.json({ error: 'Only SELECT, INSERT, UPDATE, DELETE are allowed' }, { status: 403 });
    }

    const stmt = context.env.DB.prepare(sql);
    const bound = params?.length ? stmt.bind(...params) : stmt;

    if (/^\s*SELECT/i.test(sql)) {
      const { results, meta } = await bound.all();
      return Response.json({ results, meta });
    } else {
      const meta = await bound.run();
      return Response.json({ results: [], meta });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
