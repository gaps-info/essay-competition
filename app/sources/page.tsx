"use client";

import { FormEvent, useEffect, useState } from "react";
import "./sources.css";

type SavedSource = { id: number; title: string; url: string; createdAt: string };

export default function SourcesPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSources() {
    const response = await fetch("/api/sources", { cache: "no-store" });
    if (!response.ok) throw new Error("load failed");
    const data = await response.json() as { sources?: SavedSource[] };
    setSources(data.sources ?? []);
  }

  useEffect(() => {
    loadSources().catch(() => setMessage("目前無法載入資料，請稍後再試。"))
      .finally(() => setLoading(false));
  }, []);

  async function saveSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
    const result = await response.json() as { error?: string };
    if (response.status === 409) {
      setMessage("這個網址已經收藏過了，可以直接在右邊的清單中查看。" );
    } else if (!response.ok) {
      setMessage(result.error === "invalid url" ? "請貼上以 http:// 或 https:// 開頭的完整網址。" : "儲存失敗，請確認內容後再試一次。");
    } else {
      setTitle("");
      setUrl("");
      setMessage("✓ 網頁資料已儲存，兩位同學都能看到。" );
      await loadSources();
    }
    setSaving(false);
  }

  return (
    <main className="sourcesPage">
      <header className="sourcesTopbar">
        <a href="/" className="sourcesBack">← 返回章節練習</a>
        <div><span>藏</span><strong>網頁資料收集區</strong></div>
        <a href="/collab">前往正式共編 →</a>
      </header>
      <section className="sourcesIntro">
        <p className="eyebrow">SOURCE LIBRARY · 研究資料庫</p>
        <h1>找到好資料，先收藏在這裡。</h1>
        <p>貼上網頁標題和網址，兩位同學就能一起查看，之後寫文獻探討時再回來使用。</p>
      </section>
      <section className="sourcesWorkspace">
        <form className="sourceForm" onSubmit={saveSource}>
          <div><p className="stepTag">STEP 01</p><h2>新增一筆網頁資料</h2><small>請打開原始網頁後，再複製真正的標題與網址。</small></div>
          <label htmlFor="source-title">網頁標題</label>
          <input id="source-title" required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：食藥署公布中聯油脂事件調查結果" />
          <label htmlFor="source-url">網頁網址</label>
          <input id="source-url" required type="url" maxLength={2000} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://……" />
          <button disabled={saving || !title.trim() || !url.trim()}>{saving ? "正在儲存……" : "儲存到共用資料區"}</button>
          {message && <p className="sourceMessage" role="status">{message}</p>}
          <p className="sourceTip">AI回答與搜尋結果摘要不是原始資料，請儲存實際發布內容的網頁。</p>
        </form>
        <section className="sourceList">
          <header><div><p className="stepTag">STEP 02</p><h2>大家收藏的網頁</h2></div><span>{sources.length} 筆</span></header>
          {loading ? <div className="emptySources"><strong>正在載入資料……</strong></div> : sources.length === 0 ? <div className="emptySources"><strong>還沒有收藏資料</strong><p>完成左邊的標題和網址後，第一筆資料就會出現在這裡。</p></div> : <div className="savedSources">{sources.map((source, index) => <article key={source.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{source.title}</h3><a href={source.url} target="_blank" rel="noreferrer">{source.url}</a><small>儲存日期：{new Date(source.createdAt).toLocaleDateString("zh-TW")}</small></div><a className="openSource" href={source.url} target="_blank" rel="noreferrer" aria-label={`開啟${source.title}`}>開啟 ↗</a></article>)}</div>}
        </section>
      </section>
    </main>
  );
}
