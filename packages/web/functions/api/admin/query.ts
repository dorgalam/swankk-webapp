import type { Env } from '../../../../../types/env';

const ALLOWED = /^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i;
const BLOCKED = /\b(DROP|ALTER|CREATE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b/i;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { sql, params } = await context.request.json() as { sql: string; params?: unknown[] };

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
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
};
