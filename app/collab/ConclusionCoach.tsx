"use client";

import { useEffect, useState } from "react";

const lessons = [
  { title: "大家擔心，也了解嗎？", kind: "結論", data: "88.5%的人看到食安新聞會擔心家中油品；51.4%的人對有害物質只是「聽過，但不太了解」。", questions: ["大家會不會擔心食用油安全？你從哪個數字看出來？", "大家清楚知道有害物質是什麼嗎？", "把這兩個回答放在一起，你發現了什麼？"] },
  { title: "哪些知識還不清楚？", kind: "結論", data: "學生答對反覆加熱題的比例是43.6%，答對精製判斷題的比例是25.6%。兩題答對的人都不到一半。", questions: ["哪一題答對的人比較少？", "這兩題的結果告訴我們，學生還需要了解什麼？", "你會怎麼向同學說明這個發現？選一個數字支持你的說法。"] },
  { title: "大家從哪裡看消息？", kind: "結論", data: "63.6%的人從電視、報紙或新聞網站接收食用油安全資訊；43.2%的人從社群媒體或通訊軟體接收資訊。這題可以複選。", questions: ["這兩種管道，哪一種有比較多人使用？", "從這些數字，你看出大家常在哪裡接觸食安消息？", "我們有測試大家會不會查證嗎？沒有測試的事，可以直接下結論嗎？"] },
  { title: "老師可以怎麼幫忙？", kind: "建議", data: "回想剛才的發現：學生答對反覆加熱與精製判斷題的人都不到一半。", questions: ["你想請老師幫同學了解哪一個觀念？", "可以安排什麼活動，讓同學比較容易懂？", "這個活動和剛才哪一項發現有關？"] },
  { title: "食安單位可以怎麼幫忙？", kind: "建議", data: "88.5%的人看到食安新聞會擔心家中油品；84.2%的人願意花時間學習食用油安全知識。", questions: ["遇到食安新聞時，大家最需要先弄清楚什麼？", "你希望食安單位用什麼方式說明，讓大家看得懂？", "這個做法能幫大家了解什麼？"] },
  { title: "我們和家人可以怎麼做？", kind: "建議", data: "71.8%的人會參考油品包裝上的標示判斷安全；43.2%的人從社群媒體或通訊軟體接收食安資訊。", questions: ["看油品包裝或食安消息時，你和家人可以先確認什麼？", "選一件家裡做得到的事，說清楚要怎麼做。", "你提出這個做法，是因為調查中的哪個發現？"] },
];
type Draft = { answers: string[]; title: string; paragraph: string };
const emptyDrafts = (): Draft[] => lessons.map(() => ({ answers: ["", "", ""], title: "", paragraph: "" }));

export default function ConclusionCoach({ editor, onAppend, disabled }: { editor: string; onAppend: (text: string) => void; disabled: boolean }) {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>(emptyDrafts);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const key = `essay-conclusion-coach-v1:${editor}`;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(saved) && saved.length === lessons.length && saved.every(d => Array.isArray(d.answers) && d.answers.length === 3 && d.answers.every((a: unknown) => typeof a === "string") && typeof d.title === "string" && typeof d.paragraph === "string")) setDrafts(saved);
    } catch { setLocalStatus("此裝置無法讀取暫存，離開前請加入正式稿並儲存。"); }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(drafts)); setLocalStatus("回答暫存在這台裝置；要讓老師看到，請加入正式稿後儲存。"); }
    catch { setLocalStatus("此裝置無法暫存，離開前請加入正式稿並儲存。"); }
  }, [drafts, key, ready]);
  const lesson = lessons[step];
  const draft = drafts[step];
  function update(change: Partial<Draft>) { setDrafts(current => current.map((d, i) => i === step ? { ...d, ...change } : d)); setMessage(""); }
  return <section className="conclusionGuide simpleCoach" aria-label="結論與建議一步一步寫">
    <h2>我們一起，一次寫一小段</h2>
    <p>先看資料，回答三個小問題，再用自己的話整理。</p>
    <label className="coachPicker">現在要寫哪一段？<select value={step} onChange={e => { setStep(Number(e.target.value)); setMessage(""); }}>{lessons.map((l, i) => <option value={i} key={l.title}>{i + 1}. {l.kind}：{l.title}</option>)}</select></label>
    <p className="coachProgress">第 {step + 1} 段，共 6 段 · {lesson.kind}</p>
    <h3>{lesson.title}</h3>
    <div className="coachData"><strong>先看這份資料</strong><p>{lesson.data}</p><a href="/results" target="_blank" rel="noreferrer">查看完整研究結果 ↗</a></div>
    <div className="coachQuestions">{lesson.questions.map((q, i) => <label key={`${step}-${i}`} htmlFor={`coach-answer-${i}`}><span>{i + 1}. {q}</span><textarea id={`coach-answer-${i}`} value={draft.answers[i]} disabled={!ready} onChange={e => update({ answers: draft.answers.map((a, j) => j === i ? e.target.value : a) })} rows={2} /></label>)}</div>
    <div className="coachCompose"><h3>把想法整理成一小段</h3><p>回頭讀自己的回答，挑重要的內容寫成兩三句，最後替這段取個小標題。</p><label htmlFor="coach-title">這一段的小標題<input id="coach-title" value={draft.title} disabled={!ready} onChange={e => update({ title: e.target.value })} /></label><label htmlFor="coach-paragraph">我的段落<textarea id="coach-paragraph" rows={4} value={draft.paragraph} disabled={!ready} onChange={e => update({ paragraph: e.target.value })} /></label></div>
    <details className="coachPreview"><summary>看看我整理的文章</summary>{["結論", "建議"].map(kind => <div key={kind}><h3>{kind === "結論" ? "一、研究結論" : "二、研究建議"}</h3>{drafts.map((d, i) => lessons[i].kind === kind && d.paragraph.trim() ? <section key={i}><h4>{d.title}</h4><p>{d.paragraph}</p></section> : null)}</div>)}<p>這裡顯示你在引導區整理的段落；共同正式稿在下方。</p></details>
    <p className="coachNote">小提醒：寫的是「這次受訪者」的情形，不能直接代表所有人。</p>
    <button className="coachAppend" disabled={disabled || !draft.paragraph.trim() || !draft.title.trim()} onClick={() => { onAppend(`${lesson.kind === "結論" ? "研究結論" : "研究建議"}｜${draft.title.trim()}\n${draft.paragraph.trim()}`); setMessage("這段已加到下方正式稿末尾。請按「儲存共同正式稿」，老師才能看到。"); }}>把這段加入下方正式稿</button>
    <p role="status">{message || localStatus}</p>
    <nav className="coachNavigation" aria-label="引導段落"><button disabled={step === 0} onClick={() => { setStep(step - 1); setMessage(""); }}>← 上一段</button><button disabled={step === lessons.length - 1} onClick={() => { setStep(step + 1); setMessage(""); }}>下一段 →</button></nav>
  </section>;
}
