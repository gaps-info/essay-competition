interface Env {
  DB: D1Database;
}

const chapters = new Set(["研究動機", "文獻探討", "研究方法", "研究結果與分析", "結論與建議"]);
const editors = new Set(["共同編輯", "欣芸", "宥晴", "老師"]);

async function prepareDb(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS collaboration_documents (
      chapter TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT '共同編輯'
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS collaboration_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter TEXT NOT NULL,
      content TEXT NOT NULL,
      edited_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_collaboration_revisions_chapter
      ON collaboration_revisions(chapter, id)`),
  ]);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  await prepareDb(env.DB);

  if (request.method === "GET") {
    const chapter = new URL(request.url).searchParams.get("chapter") ?? "";
    if (!chapters.has(chapter)) return Response.json({ error: "invalid chapter" }, { status: 400 });
    const row = await env.DB.prepare("SELECT content, updated_at, updated_by FROM collaboration_documents WHERE chapter = ?")
      .bind(chapter).first<{ content: string; updated_at: string; updated_by: string }>();
    return Response.json({ content: row?.content ?? "", updatedAt: row?.updated_at ?? null, editor: row?.updated_by ?? "" }, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "PUT") {
    const body = await request.json() as { chapter?: string; content?: string; editor?: string; expectedUpdatedAt?: string | null };
    const chapter = body.chapter ?? "";
    const editor = editors.has(body.editor ?? "") ? body.editor! : "共同編輯";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!chapters.has(chapter)) return Response.json({ error: "invalid chapter" }, { status: 400 });
    if (content.length > 50000) return Response.json({ error: "content too long" }, { status: 400 });

    const current = await env.DB.prepare("SELECT content, updated_at, updated_by FROM collaboration_documents WHERE chapter = ?")
      .bind(chapter).first<{ content: string; updated_at: string; updated_by: string }>();
    const expected = body.expectedUpdatedAt ?? null;
    if ((current?.updated_at ?? null) !== expected) {
      return Response.json({ error: "conflict", content: current?.content ?? "", updatedAt: current?.updated_at ?? null, editor: current?.updated_by ?? "另一位編輯者" }, { status: 409 });
    }

    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO collaboration_documents (chapter, content, updated_at, updated_by)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(chapter) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
        .bind(chapter, content, now, editor),
      env.DB.prepare("INSERT INTO collaboration_revisions (chapter, content, edited_by, created_at) VALUES (?, ?, ?, ?)")
        .bind(chapter, content, editor, now),
    ]);
    return Response.json({ ok: true, updatedAt: now, editor });
  }

  return new Response("Method not allowed", { status: 405 });
};
