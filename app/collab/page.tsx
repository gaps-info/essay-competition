"use client";

import { useEffect, useState } from "react";
import "./collab.css";

const chapters = ["研究動機", "文獻探討", "研究方法", "研究結果與分析", "結論與建議"];
type CloudCopy = { content: string; updatedAt: string | null; editor: string };

export default function CollaborationPage() {
  const [chapter, setChapter] = useState(0);
  const [content, setContent] = useState("");
  const [editor, setEditor] = useState("共同編輯");
  const [drafts, setDrafts] = useState(["", ""]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [lastEditor, setLastEditor] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "conflict" | "error">("idle");
  const [latestCloudCopy, setLatestCloudCopy] = useState<CloudCopy | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadChapter() {
      setLoading(true);
      setSaveState("idle");
      setLatestCloudCopy(null);
      const selected = chapters[chapter];
      const [sharedResponse, draftsResponse] = await Promise.all([
        fetch(`/api/collaboration?chapter=${encodeURIComponent(selected)}`, { cache: "no-store" }),
        fetch(`/api/practice?chapter=${encodeURIComponent(selected)}`, { cache: "no-store" }),
      ]);
      if (cancelled) return;
      if (sharedResponse.ok) {
        const shared = await sharedResponse.json() as CloudCopy;
        setContent(shared.content ?? "");
        setUpdatedAt(shared.updatedAt ?? null);
        setLastEditor(shared.editor ?? "");
        setDirty(false);
      }
      if (draftsResponse.ok) {
        const individual = await draftsResponse.json() as { answers?: string[] };
        setDrafts([individual.answers?.[0] ?? "", individual.answers?.[1] ?? ""]);
      }
      setLoading(false);
    }
    loadChapter().catch(() => { if (!cancelled) { setLoading(false); setSaveState("error"); } });
    return () => { cancelled = true; };
  }, [chapter]);

  function updateContent(value: string) {
    setContent(value);
    setDirty(true);
    setSaveState("idle");
  }

  function appendDraft(draft: string) {
    if (!draft.trim()) return;
    updateContent(`${content}${content.trim() ? "\n\n" : ""}${draft.trim()}`);
  }

  async function saveDocument() {
    setSaveState("saving");
    const response = await fetch("/api/collaboration", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter: chapters[chapter], content, editor, expectedUpdatedAt: updatedAt }),
    });
    const result = await response.json() as CloudCopy & { error?: string };
    if (response.status === 409) {
      setLatestCloudCopy({ content: result.content ?? "", updatedAt: result.updatedAt ?? null, editor: result.editor ?? "另一位編輯者" });
      setSaveState("conflict");
      return;
    }
    if (!response.ok) { setSaveState("error"); return; }
    setUpdatedAt(result.updatedAt ?? null);
    setLastEditor(result.editor ?? editor);
    setDirty(false);
    setSaveState("saved");
  }

  async function checkLatest() {
    const response = await fetch(`/api/collaboration?chapter=${encodeURIComponent(chapters[chapter])}`, { cache: "no-store" });
    if (!response.ok) { setSaveState("error"); return; }
    const latest = await response.json() as CloudCopy;
    if (latest.updatedAt === updatedAt) { setSaveState(dirty ? "idle" : "saved"); return; }
    if (dirty) {
      setLatestCloudCopy({ content: latest.content ?? "", updatedAt: latest.updatedAt ?? null, editor: latest.editor ?? "另一位編輯者" });
      setSaveState("conflict");
    } else {
      setContent(latest.content ?? "");
      setUpdatedAt(latest.updatedAt ?? null);
      setLastEditor(latest.editor ?? "");
      setSaveState("saved");
    }
  }

  function acceptLatest() {
    if (!latestCloudCopy) return;
    setContent(latestCloudCopy.content);
    setUpdatedAt(latestCloudCopy.updatedAt);
    setLastEditor(latestCloudCopy.editor);
    setLatestCloudCopy(null);
    setDirty(false);
    setSaveState("saved");
  }

  return (
    <main className="collabPage">
      <header className="collabTopbar">
        <a href="/" className="backLink">← 返回章節練習</a>
        <div className="collabBrand"><span>共</span><div><strong>正式共編工作室</strong><small>欣芸 × 宥晴</small></div></div>
        <span className="cloudStatus"><i /> 共用文章已開放</span>
      </header>

      <section className="collabIntro">
        <div><p className="eyebrow">FORMAL COLLABORATION · 正式共編</p><h1>把兩份想法，整理成一篇文章。</h1><p>先查看兩人的個別練習，再共同選擇內容、補上證據，最後儲存為正式稿。</p></div>
        <div className="editorIdentity"><label htmlFor="editor">目前編輯者</label><select id="editor" value={editor} onChange={(event) => setEditor(event.target.value)}><option>共同編輯</option><option>欣芸</option><option>宥晴</option><option>老師</option></select></div>
      </section>

      <nav className="collabChapters" aria-label="選擇共編章節">
        {chapters.map((item, index) => <button className={chapter === index ? "active" : ""} onClick={() => setChapter(index)} key={item}><span>{index + 1}</span>{item}</button>)}
      </nav>

      <section className="collabWorkspace">
        <aside className="draftShelf">
          <header><p className="eyebrow">INDIVIDUAL DRAFTS</p><h2>個別練習參考</h2><small>挑選可用的觀點，不必全部照搬。</small></header>
          <article><div><span className="draftAvatar cai">蔡</span><strong>欣芸的練習</strong></div><p>{loading ? "正在載入……" : drafts[0] || "這個章節還沒有個別練習。"}</p><button disabled={!drafts[0]} onClick={() => appendDraft(drafts[0])}>加入正式稿</button></article>
          <article><div><span className="draftAvatar yan">嚴</span><strong>宥晴的練習</strong></div><p>{loading ? "正在載入……" : drafts[1] || "這個章節還沒有個別練習。"}</p><button disabled={!drafts[1]} onClick={() => appendDraft(drafts[1])}>加入正式稿</button></article>
        </aside>

        <article className="sharedDocument">
          <header><div><p className="eyebrow">SHARED DOCUMENT</p><h2>{chapters[chapter]}・共同正式稿</h2></div><div className="documentTools"><span>{content.replace(/\s/g, "").length} 字</span><button onClick={checkLatest}>載入最新版</button></div></header>
          {saveState === "conflict" && <div className="conflictNotice"><p><strong>雲端已有較新的內容。</strong>您的文字仍保留在畫面上。請先複製自己的文字，再載入 {latestCloudCopy?.editor} 儲存的最新版進行合併。</p><div><button onClick={() => navigator.clipboard.writeText(content)}>複製我的文字</button><button onClick={acceptLatest}>載入雲端最新版</button></div></div>}
          <label htmlFor="shared-content">兩人共同整理的內容</label>
          <textarea id="shared-content" disabled={loading} value={content} onChange={(event) => updateContent(event.target.value)} placeholder="比較兩人的個別練習後，在這裡共同整理正式文章。請保留自己的語氣，並為資料加上正確引用。" />
          <footer><p>{loading ? "正在載入共用文章……" : saveState === "saving" ? "正在儲存……" : saveState === "saved" ? `✓ 已同步到雲端${lastEditor ? `・最後編輯：${lastEditor}` : ""}` : saveState === "error" ? "儲存或載入失敗，請再試一次" : dirty ? "有尚未儲存的修改" : updatedAt ? `已載入雲端版本${lastEditor ? `・最後編輯：${lastEditor}` : ""}` : "尚未建立這個章節的正式稿"}</p><button disabled={loading || saveState === "saving" || !dirty} onClick={saveDocument}>儲存共同正式稿</button></footer>
        </article>
      </section>
    </main>
  );
}
