interface Env {
  DB: D1Database;
}

async function prepareDb(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS research_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_research_sources_url ON research_sources(url)"),
  ]);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  await prepareDb(env.DB);

  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT id, title, url, created_at FROM research_sources ORDER BY id DESC LIMIT 200").all<{ id: number; title: string; url: string; created_at: string }>();
    return Response.json({ sources: result.results.map((item) => ({ id: item.id, title: item.title, url: item.url, createdAt: item.created_at })) }, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "POST") {
    const body = await request.json() as { title?: string; url?: string };
    const title = body.title?.trim() ?? "";
    const rawUrl = body.url?.trim() ?? "";
    if (!title || title.length > 300) return Response.json({ error: "invalid title" }, { status: 400 });
    let normalizedUrl: string;
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("invalid protocol");
      normalizedUrl = parsed.toString();
    } catch {
      return Response.json({ error: "invalid url" }, { status: 400 });
    }
    if (normalizedUrl.length > 2000) return Response.json({ error: "invalid url" }, { status: 400 });
    try {
      const createdAt = new Date().toISOString();
      const result = await env.DB.prepare("INSERT INTO research_sources (title, url, created_at) VALUES (?, ?, ?)")
        .bind(title, normalizedUrl, createdAt).run();
      return Response.json({ ok: true, id: result.meta.last_row_id, createdAt });
    } catch (error) {
      if (String(error).includes("UNIQUE")) return Response.json({ error: "duplicate" }, { status: 409 });
      throw error;
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
