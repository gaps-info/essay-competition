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
    const sectionCount = chapter === "文獻探討進階" ? 9 : chapter === "文獻探討" ? 8 : 3;
    const sections = [Array(sectionCount).fill(""), Array(sectionCount).fill("")];
    for (const student of students) {
      const row = await env.DB.prepare("SELECT content FROM practices WHERE student = ? AND chapter = ?").bind(student, chapter).first<{ content: string }>();
      const index = students.indexOf(student);
      const stored = row?.content ?? "";
      if ((chapter === "研究動機" || chapter === "文獻探討" || chapter === "文獻探討進階") && stored.startsWith("{")) {
        try {
          const parsed = JSON.parse(stored) as { article?: string; sections?: string[] };
          answers[index] = parsed.article ?? "";
          sections[index] = parsed.sections?.slice(0, sectionCount) ?? Array(sectionCount).fill("");
        } catch { answers[index] = stored; sections[index][0] = stored; }
      } else {
        answers[index] = stored;
        if (chapter === "研究動機" || chapter === "文獻探討" || chapter === "文獻探討進階") sections[index][0] = stored;
      }
    }
    return Response.json({ answers, sections }, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "PUT") {
    const body = await request.json() as { student?: number; chapter?: string; content?: string; sections?: string[] };
    const student = students[body.student ?? -1];
    if (!student) return Response.json({ error: "invalid student" }, { status: 400 });
    const maxSections = body.chapter === "文獻探討進階" ? 9 : body.chapter === "文獻探討" ? 8 : 3;
    const cleanSections = body.sections?.slice(0, maxSections).map((item) => item.trim()) ?? [];
    let article = body.content ?? "";
    if (body.chapter === "研究動機" && cleanSections.length) article = cleanSections.filter(Boolean).join("\n\n");
    if (body.chapter === "文獻探討" && cleanSections.length) {
      const titles = ["認識食用油", "食用油怎麼製造", "食用油與健康", "消費者應該知道什麼"];
      article = titles.map((title, index) => {
        const source = cleanSections[index * 2];
        const content = cleanSections[index * 2 + 1];
        return content ? `${title}\n${content}${source ? `\n（資料來源：${source}）` : ""}` : "";
      }).filter(Boolean).join("\n\n");
    }
    if (body.chapter === "文獻探討進階" && cleanSections.length) {
      const [aiClue, keywords, sourceTitle, sourceUnit, sourceUrl, originalPoint, ownWords, researchLink, verifyNext] = cleanSections;
      article = [
        aiClue && `準備查證的說法\n${aiClue}${keywords ? `\n查證關鍵字：${keywords}` : ""}`,
        sourceTitle && `找到的原始資料\n${sourceTitle}${sourceUnit ? `／${sourceUnit}` : ""}${sourceUrl ? `\n${sourceUrl}` : ""}`,
        originalPoint && `原文重點\n${originalPoint}`,
        ownWords && `用自己的話說明\n${ownWords}`,
        researchLink && `與研究問題的關係\n${researchLink}`,
        verifyNext && `還需要查證\n${verifyNext}`,
      ].filter(Boolean).join("\n\n");
    }
    const storedContent = body.chapter === "研究動機" || body.chapter === "文獻探討" || body.chapter === "文獻探討進階"
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
