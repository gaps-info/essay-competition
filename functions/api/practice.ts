interface Env {
  DB: D1Database;
}

const students = ["xinyun", "youqing"];

async function prepareDb(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS practices (
    student TEXT NOT NULL,
    chapter TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    PRIMARY KEY (student, chapter)
  )`).run();
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  await prepareDb(env.DB);

  if (request.method === "GET") {
    const chapter = new URL(request.url).searchParams.get("chapter") ?? "";
    const answers = ["", ""];
    for (const student of students) {
      const row = await env.DB.prepare("SELECT content FROM practices WHERE student = ? AND chapter = ?").bind(student, chapter).first<{ content: string }>();
      answers[students.indexOf(student)] = row?.content ?? "";
    }
    return Response.json({ answers }, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "PUT") {
    const body = await request.json() as { student?: number; chapter?: string; content?: string };
    const student = students[body.student ?? -1];
    if (!student) return Response.json({ error: "invalid student" }, { status: 400 });
    await env.DB.prepare(`INSERT INTO practices (student, chapter, content, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(student, chapter) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`)
      .bind(student, body.chapter ?? "", body.content ?? "").run();
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
