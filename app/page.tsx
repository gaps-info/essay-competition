"use client";

import { useEffect, useState } from "react";

const chapters = ["研究動機", "文獻探討", "研究方法", "研究結果與分析", "結論與建議"];

const prompts = [
  {
    title: "第一節｜研究動機",
    question: "用兩段文字，說清楚你為什麼想研究這個問題",
    description: "篇幅不用多。先讓沒有接觸過題目的讀者理解現象，再說明你從中注意到什麼值得研究的問題。",
    tip: "客觀描述是交代可被觀察或查證的情況，不加入個人好惡與結論；個人的疑問與思考留到第二段。",
  },
];

const coachChecks = [
  "說明了具體、可理解的現象",
  "現象有資料、事件或生活觀察支持",
  "寫出自己的想法，而非只整理資料",
  "形成一個可以繼續探究的疑問",
  "能自然銜接到下一節研究目的",
];

const guidingQuestions = [
  "你說的這個現象，主要發生在哪些人身上？",
  "有什麼資料可以證明這個現象確實存在？",
  "這件事讓你最好奇、最想追問的是哪一點？",
  "如果只能研究一件事，你會選擇什麼？",
];

export default function Home() {
  const [chapter, setChapter] = useState(0);
  const [answers, setAnswers] = useState(["", ""]);
  const [sections, setSections] = useState<string[][]>([["", "", ""], ["", "", ""]]);
  const [saved, setSaved] = useState([false, false]);
  const [showCollab, setShowCollab] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [checkStates, setCheckStates] = useState<string[][]>(() => [
    coachChecks.map(() => "unset"),
    coachChecks.map(() => "unset"),
  ]);
  const [coachNotes, setCoachNotes] = useState(["", ""]);

  useEffect(() => {
    async function loadAnswers() {
      const response = await fetch(`/api/practice?chapter=${encodeURIComponent(chapters[chapter])}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json() as { answers: string[]; sections?: string[][] };
        setAnswers(data.answers);
        setSections(data.sections ?? [["", "", ""], ["", "", ""]]);
        setSaved([true, true]);
      }
    }
    loadAnswers();
  }, [chapter]);

  function updateAnswer(student: number, value: string) {
    setAnswers((current) => current.map((item, index) => (index === student ? value : item)));
    setSaved((current) => current.map((item, index) => (index === student ? false : item)));
  }

  function updateSection(student: number, section: number, value: string) {
    setSections((current) => {
      const next = current.map((items) => [...items]);
      next[student][section] = value;
      setAnswers((answersNow) => answersNow.map((answer, index) => index === student ? next[student].filter(Boolean).join("\n\n") : answer));
      return next;
    });
    setSaved((current) => current.map((item, index) => (index === student ? false : item)));
  }

  async function saveAnswer(student: number) {
    const response = await fetch("/api/practice", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter: chapters[chapter], student, content: answers[student], sections: chapter === 0 ? sections[student] : undefined }),
    });
    if (response.ok) setSaved((current) => current.map((item, index) => (index === student ? true : item)));
  }

  function cycleCheck(student: number, item: number) {
    const order = ["unset", "yes", "developing", "missing"];
    setCheckStates((current) => current.map((studentStates, studentIndex) =>
      studentIndex === student
        ? studentStates.map((state, itemIndex) => itemIndex === item ? order[(order.indexOf(state) + 1) % order.length] : state)
        : studentStates
    ));
  }

  function addQuestion(student: number, question: string) {
    setCoachNotes((current) => current.map((note, index) => index === student
      ? `${note}${note ? "\n" : ""}• ${question}`
      : note
    ));
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="小論文練習室首頁">
          <span className="brandMark">研</span>
          <span><strong>小論文練習室</strong><small>從想法，到有根據的論述</small></span>
        </a>
        <div className="headerActions">
          <span className="localBadge"><i /> 雲端同步模式</span>
          <button className="collabButton" onClick={() => setShowCollab(true)}>
            <strong>進入正式共編</strong>
            <small>課程結束後開放</small>
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">CHAPTER PRACTICE · 章節練習</p>
          <h1>同一題目，<em>各自練出</em><br />自己的論述。</h1>
          <p className="lead">兩位選手先獨立思考、分別作答，再由指導老師帶領比較觀點、補足證據，為正式共編做好準備。</p>
        </div>
        <div className="progressCard">
          <span>本次培訓進度</span>
          <strong>{chapter + 1}<small> / {chapters.length} 章</small></strong>
          <div className="progressTrack"><i style={{ width: `${((chapter + 1) / chapters.length) * 100}%` }} /></div>
          <p>目前練習：{chapters[chapter]}</p>
        </div>
      </section>

      <nav className="chapters" aria-label="選擇練習章節">
        {chapters.map((item, index) => (
          <button className={index === chapter ? "active" : ""} onClick={() => setChapter(index)} key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>{item}
          </button>
        ))}
      </nav>

      <section className="promptCard">
        <div className="promptNumber">{String(chapter + 1).padStart(2, "0")}</div>
        <div>
          <p className="eyebrow">TODAY'S WRITING PROMPT</p>
          <h2>{prompts[chapter]?.question ?? `${chapters[chapter]}：請先寫出你認為最重要的核心內容`}</h2>
          <p>{prompts[chapter]?.description ?? "先不要追求完美。請用自己的話寫下核心內容，再補上可查證的資料。"}</p>
        </div>
        <aside><strong>老師提醒</strong><p>{prompts[chapter]?.tip ?? "先完成論述骨架，再逐步補上證據與引用來源。"}</p></aside>
      </section>

      {chapter === 0 && (
        <section className="introGuide">
          <div className="guideHeading">
            <p className="eyebrow">第壹章 · 緒論</p>
            <h2>緒論不必長，讓思考順順地往下走。</h2>
            <p>研究動機負責把問題帶進來，研究目的則把問題轉成這次研究要完成的任務。</p>
          </div>
          <div className="argumentFlow" aria-label="緒論寫作順序">
            <div className="current"><span>第一段</span><strong>現象說明</strong><small>客觀發生了什麼？</small></div>
            <b>→</b>
            <div className="current"><span>第二段</span><strong>個人思考</strong><small>你發現什麼疑問？</small></div>
            <b>→</b>
            <div><span>銜接</span><strong>研究問題</strong><small>真正想知道什麼？</small></div>
            <b>→</b>
            <div className="current"><span>第二節</span><strong>研究目的</strong><small>這次要完成什麼？</small></div>
          </div>
        </section>
      )}

      <section className="workspace">
        {["欣芸", "宥晴"].map((student, index) => (
          <article className={`studentCard student${index}`} key={student}>
            <header>
              <div className="avatar">{index === 0 ? "蔡" : "嚴"}</div>
              <div><p>{student}</p><span>學生獨立練習區</span></div>
              <span className="wordCount">{answers[index].replace(/\s/g, "").length} 字</span>
            </header>
            {chapter === 0 ? (
              <div className="sectionFields">
                <section>
                  <div className="sectionLabel"><span>01</span><div><strong>客觀描述現象</strong><small>先讓讀者理解實際發生了什麼</small></div></div>
                  <ul><li>現象發生在什麼情境、哪些人身上？</li><li>有哪些可以觀察或查證的情況？</li><li>有沒有資料、事件或實例支持？</li></ul>
                  <textarea aria-label={`${student}的客觀現象`} value={sections[index][0]} onChange={(event) => updateSection(index, 0, event.target.value)} placeholder="在此整理第一段內容" />
                </section>
                <section>
                  <div className="sectionLabel"><span>02</span><div><strong>個人想法與研究問題</strong><small>從現象找出值得探究的疑問</small></div></div>
                  <ul><li>你從上述現象注意到什麼問題？</li><li>哪一部分讓你感到疑惑？</li><li>真正想透過研究釐清什麼？</li></ul>
                  <textarea aria-label={`${student}的個人想法`} value={sections[index][1]} onChange={(event) => updateSection(index, 1, event.target.value)} placeholder="在此整理第二段內容" />
                </section>
                <section>
                  <div className="sectionLabel"><span>03</span><div><strong>研究目的</strong><small>承接問題，說明研究要完成的事</small></div></div>
                  <ul><li>每項目的是否對應前面提出的問題？</li><li>研究完成後，預計了解、分析或比較什麼？</li></ul>
                  <textarea aria-label={`${student}的研究目的`} value={sections[index][2]} onChange={(event) => updateSection(index, 2, event.target.value)} placeholder="在此整理研究目的" />
                </section>
              </div>
            ) : (
              <><label htmlFor={`answer-${index}`}>{prompts[chapter]?.title ?? "我的初步想法"}</label><textarea id={`answer-${index}`} value={answers[index]} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="先想清楚本章要回答的問題，再用自己的方式組織內容。" /></>
            )}
            <footer>
              <span>{saved[index] ? "✓ 已整併並同步到雲端" : chapter === 0 ? "儲存時會自動整併三區內容" : "尚未儲存"}</span>
              <button onClick={() => saveAnswer(index)}>儲存練習</button>
            </footer>
            {chapter === 0 && (
              <section className="articlePreview">
                <div className="articlePreviewTitle">
                  <div><span>MERGED ARTICLE</span><strong>完整文章預覽</strong></div>
                  <small>{answers[index].replace(/\s/g, "").length} 字</small>
                </div>
                {answers[index] ? <div className="articleBody">{answers[index]}</div> : <p>完成上方分區後，整併的文章會顯示在這裡。</p>}
              </section>
            )}
          </article>
        ))}
      </section>

      <section className="coachStrip">
        <div><span>指導下一步</span><h2>兩位都完成後，一起找出論述中的「共同點」與「不同證據」。</h2></div>
        <button onClick={() => setShowCoach(true)}>開啟教師引導單</button>
      </section>

      {showCoach && (
        <div className="coachBackdrop" onClick={() => setShowCoach(false)} role="presentation">
          <aside className="coachDrawer" role="dialog" aria-modal="true" aria-labelledby="coach-title" onClick={(event) => event.stopPropagation()}>
            <header className="coachHeader">
              <div>
                <p className="eyebrow">TEACHER'S GUIDE · 教師引導單</p>
                <h2 id="coach-title">先看見思考，再引導修改。</h2>
                <p>{prompts[chapter]?.title ?? chapters[chapter]}・雙欄對照與引導紀錄</p>
              </div>
              <button aria-label="關閉教師引導單" onClick={() => setShowCoach(false)}>×</button>
            </header>

            <div className="coachLegend">
              <span><i className="yes" /> 已經出現</span>
              <span><i className="developing" /> 可以更清楚</span>
              <span><i className="missing" /> 尚未出現</span>
              <small>點擊檢核項目即可切換狀態</small>
            </div>

            <div className="coachStudents">
              {["欣芸", "宥晴"].map((student, studentIndex) => (
                <section className={`coachStudent coachStudent${studentIndex}`} key={student}>
                  <div className="coachStudentTitle">
                    <span className="avatar">{studentIndex === 0 ? "蔡" : "嚴"}</span>
                    <div><strong>{student}</strong><small>學生原始練習內容</small></div>
                  </div>
                  <div className="answerPreview">{answers[studentIndex] || <span>這位學生還沒有輸入內容。</span>}</div>
                  <h3>論述結構檢核</h3>
                  <div className="checkList">
                    {coachChecks.map((item, itemIndex) => (
                      <button className={checkStates[studentIndex][itemIndex]} onClick={() => cycleCheck(studentIndex, itemIndex)} key={item}>
                        <i>{checkStates[studentIndex][itemIndex] === "yes" ? "✓" : checkStates[studentIndex][itemIndex] === "developing" ? "△" : checkStates[studentIndex][itemIndex] === "missing" ? "—" : itemIndex + 1}</i>
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                  <h3>選擇一句引導提問</h3>
                  <div className="questionChips">
                    {guidingQuestions.map((question) => <button onClick={() => addQuestion(studentIndex, question)} key={question}>＋ {question}</button>)}
                  </div>
                  <label htmlFor={`coach-note-${studentIndex}`}>給 {student} 的引導與回饋</label>
                  <textarea id={`coach-note-${studentIndex}`} value={coachNotes[studentIndex]} onChange={(event) => setCoachNotes((current) => current.map((note, index) => index === studentIndex ? event.target.value : note))} placeholder="選擇上方問題，或直接寫下你想引導學生思考的方向……" />
                </section>
              ))}
            </div>
            <footer className="coachFooter">
              <p><strong>教學原則：</strong>先用問題協助學生看見缺口，不直接替學生改寫答案。</p>
              <button onClick={() => setShowCoach(false)}>儲存引導紀錄</button>
            </footer>
          </aside>
        </div>
      )}

      {showCollab && (
        <div className="modalBackdrop" onClick={() => setShowCollab(false)} role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="collab-title" onClick={(event) => event.stopPropagation()}>
            <button className="close" aria-label="關閉" onClick={() => setShowCollab(false)}>×</button>
            <span className="modalIcon">共</span>
            <p className="eyebrow">FORMAL COLLABORATION</p>
            <h2 id="collab-title">正式共編空間，預留完成。</h2>
            <p>等章節練習流程確認後，我們再一起決定內容如何整合、版本如何保留，以及老師如何回饋。</p>
            <button onClick={() => setShowCollab(false)}>先回到分欄練習</button>
          </section>
        </div>
      )}
    </main>
  );
}
