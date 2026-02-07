export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
  ).all();
  return Response.json(results.map(r => r.name));
}
