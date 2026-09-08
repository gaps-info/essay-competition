"use client";

import { useEffect, useState } from "react";
import "./collab.css";

const chapters = ["研究動機", "文獻探討", "研究方法", "研究結果與分析", "結論與建議"];
type CloudCopy = { content: string; updatedAt: string | null; editor: string };

const literatureGuideSections = [
  {
    number: "01",
    title: "中聯油脂事件的發生經過",
    question: "這次事件發生了什麼事？",
    prompts: [
      "事件是在什麼時候被發現、通報與對外說明的？",
      "是哪一種油品、哪一項物質出現問題？檢驗值和法定標準各是多少？",
      "哪些產品或業者受到影響？主管機關採取了哪些處理行動？",
      "新聞最初的說法和後來的調查結果，有沒有不同？",
    ],
    check: "完成後，要能依照時間順序說清楚事件，並在日期與數字旁標明資料來源。",
  },
  {
    number: "02",
    title: "食用油的製程與污染風險",
    question: "黃豆如何變成大豆沙拉油？哪些環節需要把關？",
    prompts: [
      "從原料驗收到取油、精煉、檢驗和分裝，各步驟的目的為何？",
      "哪些風險可能來自原料？哪些風險可能與製程或監測有關？",
      "業者為什麼不能只在最後檢驗成品？",
      "不同資料對事件原因的說明是否一致？哪一份是較晚公布的調查結果？",
    ],
    caution: "不要直接寫成「某一個步驟一定產生苯(a)駢芘」。官方調查指出，事件與高風險原料管理、製程控制及檢驗監測等多項因素交互影響有關。",
    check: "完成後，要能畫出簡單製程順序，並分辨「可能原因」和「已確認的調查結果」。",
  },
  {
    number: "03",
    title: "苯(a)駢芘與健康風險",
    question: "問題物質是什麼？健康風險要怎麼說才正確？",
    prompts: [
      "苯(a)駢芘是什麼？它是食品添加物，還是污染物？",
      "「有檢出」和「超過標準」有什麼不同？",
      "法定標準是多少？這次事件的檢驗結果是多少？",
      "健康風險和攝取量、接觸時間有什麼關係？",
    ],
    caution: "不要把危害寫成必然結果，例如「吃一次就一定會生病」。應根據可靠資料，清楚區分物質的危害和實際暴露風險。",
    check: "完成後，要能用自己的話解釋苯(a)駢芘，並正確比較檢驗值與標準。",
  },
  {
    number: "04",
    title: "食用油安全管理與事件處理",
    question: "業者與政府如何防止問題油流入市場？",
    prompts: [
      "在原料、製程、成品與通報各階段，業者應該做哪些把關？",
      "為什麼需要定期檢驗、保存紀錄和主動通報？",
      "產品的批號與流向資料，為什麼能幫助事件處理？",
      "下架、封存、回收和銷毀分別在處理什麼問題？",
    ],
    check: "完成後，要能分別說明業者與主管機關的責任，以及各項處理措施的目的。",
  },
  {
    number: "05",
    title: "消費者食安認知與正確行動",
    question: "一般人需要知道、查證與做到什麼？",
    prompts: [
      "看到食安消息時，應先核對產品名稱、品牌、日期、批號中的哪些資料？",
      "如何到政府公告或業者通知確認受影響產品？",
      "政府資料、新聞、社群貼文和 AI 回答，哪些可以當作正式引用來源？",
      "家中若有疑似問題產品，應如何確認並處理？",
      "以上哪些知識適合變成問卷題目，了解大家是否真的知道？",
    ],
    caution: "AI 可以協助理解和整理方向，但不能當作文獻來源。正式稿要引用能查到作者、機關、年份與原始網址的資料。",
    check: "完成後，要能提出可實際做到的查證方法，並挑出適合放進問卷的重點。",
  },
];

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
        <div className="collabTopActions"><a href="/sources">資料收集區</a><span className="cloudStatus"><i /> 共用文章已開放</span></div>
      </header>

      <section className="collabIntro">
        <div><p className="eyebrow">FORMAL COLLABORATION · 正式共編</p><h1>把兩份想法，整理成一篇文章。</h1><p>先查看兩人的個別練習，再共同選擇內容、補上證據，最後儲存為正式稿。</p></div>
        <div className="editorIdentity"><label htmlFor="editor">目前編輯者</label><select id="editor" value={editor} onChange={(event) => setEditor(event.target.value)}><option>共同編輯</option><option>欣芸</option><option>宥晴</option><option>老師</option></select></div>
      </section>

      <nav className="collabChapters" aria-label="選擇共編章節">
        {chapters.map((item, index) => <button className={chapter === index ? "active" : ""} onClick={() => setChapter(index)} key={item}><span>{index + 1}</span>{item}</button>)}
      </nav>

      {chapter === 1 && (
        <section className="literatureGuide" aria-labelledby="literature-guide-title">
          <header className="literatureGuideHeader">
            <div>
              <p className="eyebrow">LITERATURE REVIEW GUIDE · 文獻探討引導</p>
              <h2 id="literature-guide-title">先理解資料，再用自己的話整理</h2>
              <p>依序完成五個部分。每一部分都要比較不同來源，不能只抄一篇文章，也不能把 AI 當成引用來源。</p>
            </div>
            <div className="guideSafetyNote"><strong>原稿安全</strong><span>這裡只是提示，不會自動加入或改動共同正式稿。</span></div>
          </header>

          <div className="guideWorkflow" aria-label="文獻探討三個步驟">
            <div><span>1</span><p><strong>找資料</strong>每個主題至少找 3 個可靠來源</p></div>
            <div><span>2</span><p><strong>比一比</strong>確認日期、數字與不同說法</p></div>
            <div><span>3</span><p><strong>整理引用</strong>用自己的話寫，標明作者或機關與年份</p></div>
          </div>

          <div className="guideCards">
            {literatureGuideSections.map((section, index) => (
              <details className="guideCard" key={section.number} open={index === 0 ? true : undefined}>
                <summary>
                  <span>{section.number}</span>
                  <div><small>第 {index + 1} 部分</small><strong>{section.title}</strong></div>
                  <i aria-hidden="true">＋</i>
                </summary>
                <div className="guideCardBody">
                  <p className="guideMainQuestion">要回答：{section.question}</p>
                  <ul>{section.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
                  {section.caution && <p className="guideCaution"><strong>特別注意</strong>{section.caution}</p>}
                  <p className="guideCheck"><strong>完成檢查</strong>{section.check}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

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
