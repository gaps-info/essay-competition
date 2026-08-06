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
    const sections = [["", "", ""], ["", "", ""]];
    for (const student of students) {
      const row = await env.DB.prepare("SELECT content FROM practices WHERE student = ? AND chapter = ?").bind(student, chapter).first<{ content: string }>();
      const index = students.indexOf(student);
      const stored = row?.content ?? "";
      if (chapter === "研究動機" && stored.startsWith("{")) {
        try {
          const parsed = JSON.parse(stored) as { article?: string; sections?: string[] };
          answers[index] = parsed.article ?? "";
          sections[index] = parsed.sections?.slice(0, 3) ?? ["", "", ""];
        } catch { answers[index] = stored; sections[index][0] = stored; }
      } else {
        answers[index] = stored;
        if (chapter === "研究動機") sections[index][0] = stored;
      }
    }
    return Response.json({ answers, sections }, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "PUT") {
    const body = await request.json() as { student?: number; chapter?: string; content?: string; sections?: string[] };
    const student = students[body.student ?? -1];
    if (!student) return Response.json({ error: "invalid student" }, { status: 400 });
    const cleanSections = body.sections?.slice(0, 3).map((item) => item.trim()) ?? [];
    const article = cleanSections.length ? cleanSections.filter(Boolean).join("\n\n") : (body.content ?? "");
    const storedContent = body.chapter === "研究動機"
      ? JSON.stringify({ sections: cleanSections, article })
      : article;
    await env.DB.prepare(`INSERT INTO practices (student, chapter, content, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(student, chapter) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`)
      .bind(student, body.chapter ?? "", storedContent).run();
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
