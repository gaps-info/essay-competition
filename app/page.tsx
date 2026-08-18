"use client";

import { useEffect, useState } from "react";

const chapters = ["研究動機", "文獻探討", "文獻探討進階", "研究方法", "研究結果與分析", "結論與建議"];

const prompts = [
  {
    title: "第一節｜研究動機",
    question: "用兩段文字，說清楚你為什麼想研究這個問題",
    description: "篇幅不用多。先讓沒有接觸過題目的讀者理解現象，再說明你從中注意到什麼值得研究的問題。",
    tip: "客觀描述是交代可被觀察或查證的情況，不加入個人好惡與結論；個人的疑問與思考留到第二段。",
  },
  {
    title: "第貳章｜文獻探討",
    question: "把查到的資料，整理成能回答研究問題的內容",
    description: "一次完成一張任務卡。先記錄資料來源，再用自己的話說明重點，不需要照著原文抄寫。",
    tip: "資料不必多，重點是看懂、說清楚，並確認內容真的和食用油研究有關。",
  },
  {
    title: "文獻探討｜進階練習",
    question: "閱讀老師提供的文本，練習改寫與引用",
    description: "先找出重要內容，再用自己的話改寫，最後標示資料來源。AI 可以協助理解，但不能當作引用來源。",
    tip: "引用不是整段照抄。讀懂後先關掉原文，再用自己的話說明，並讓讀者知道資料來自哪裡。",
  },
];

const literatureTasks = [
  { number: "01", title: "認識食用油", subtitle: "先了解生活中常見的油品", questions: ["常見的食用油有哪些？", "它們分別使用什麼原料？", "生活中通常怎麼使用？"] },
  { number: "02", title: "食用油怎麼製造", subtitle: "整理從原料變成油品的過程", questions: ["使用什麼原料？", "大約經過哪些製作步驟？", "不同製造方法有什麼明顯差異？"] },
  { number: "03", title: "食用油與健康", subtitle: "了解成分、使用方式與健康的關係", questions: ["資料提到哪些成分？", "它說的是適量食用，還是完全不能食用？", "保存、加熱或重複使用可能造成什麼影響？"] },
  { number: "04", title: "消費者應該知道什麼", subtitle: "為後續的食安認知問卷做準備", questions: ["購買時可以注意哪些標示？", "保存和使用油品時應注意什麼？", "哪些知識適合放進消費者問卷？"] },
];

const citationPracticeTexts = [
  {
    number: "01",
    title: "植物油如何取得與精煉",
    sourceTitle: "正確選用植物油，安心享用無負擔！",
    unit: "衛生福利部食品藥物管理署",
    citationName: "食品藥物管理署",
    year: "2025",
    date: "2025年3月28日",
    url: "https://www.fda.gov.tw/tc/PublishOtherEpaperContent.aspx?id=1559&r=1428801689&tid=5140",
    text: "植物油可利用壓榨法或溶劑萃取法取得。油脂含量較高的橄欖、芝麻、花生常使用壓榨法；黃豆等油脂含量較低的原料，則可能使用溶劑萃取。取得油脂後，還可經過脫膠、脫酸、脫色及脫臭等精煉程序，去除雜質並提高油品的穩定性。",
  },
  {
    number: "02",
    title: "為什麼不宜反覆使用炸油",
    sourceTitle: "油品混充及違法添加銅葉綠素事件Q&A",
    unit: "衛生福利部食品藥物管理署",
    citationName: "食品藥物管理署",
    year: "2013",
    date: "2013年10月22日",
    url: "https://www.fda.gov.tw/tc/sitecontent.aspx?sid=3694",
    text: "油脂反覆加熱使用時，氧化物會逐漸累積，油品的發煙點也可能下降。當炸油出現顏色變深、變得黏稠、容易冒煙或產生大量泡沫等情況，就表示油品品質可能已經改變，不適合繼續使用。",
  },
  {
    number: "03",
    title: "銅葉綠素油品事件",
    sourceTitle: "食品消費權益事件中預防措施之妥適性——以銅葉綠素事件為例",
    unit: "黃士洋、吳宗熹、潘志寬",
    citationName: "黃士洋等人",
    year: "2014",
    date: "2014年",
    url: "https://www.fda.gov.tw/tc/includes/GetFile.ashx?cid=27828&id=f636725224735036796",
    text: "臺灣曾查獲標示為百分之百特級橄欖油的產品，疑似混入其他油脂，並違法添加銅葉綠素。當時主管機關除了下架、封存相關油品，也建立檢驗方法，希望判斷食用油中是否含有銅葉綠素。這起事件同時涉及食品安全、標示是否誠實，以及消費者知情的權利。",
  },
];

function mergeChapterSections(chapter: number, values: string[]) {
  if (chapter === 1) {
    return literatureTasks.map((task, index) => {
      const source = values[index * 2]?.trim();
      const content = values[index * 2 + 1]?.trim();
      if (!content) return "";
      return `${task.title}\n${content}${source ? `\n（資料來源：${source}）` : ""}`;
    }).filter(Boolean).join("\n\n");
  }
  if (chapter === 2) {
    return citationPracticeTexts.map((practice, index) => {
      const [important, rewrite, inText, reference] = values.slice(index * 4, index * 4 + 4).map((value) => value?.trim() ?? "");
      if (![important, rewrite, inText, reference].some(Boolean)) return "";
      return [
        `練習文本${practice.number}｜${practice.title}`,
        important && `我選出的重要內容\n${important}`,
        rewrite && `用自己的話改寫\n${rewrite}`,
        inText && `正文引用練習\n${inText}`,
        reference && `參考資料\n${reference}`,
      ].filter(Boolean).join("\n");
    }).filter(Boolean).join("\n\n");
  }
  return values.filter((value) => value.trim()).join("\n\n");
}

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
  const [citationStyles, setCitationStyles] = useState<string[][]>(() => [
    citationPracticeTexts.map(() => "narrative"),
    citationPracticeTexts.map(() => "narrative"),
  ]);
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
      setAnswers((answersNow) => answersNow.map((answer, index) => index === student ? mergeChapterSections(chapter, next[student]) : answer));
      return next;
    });
    setSaved((current) => current.map((item, index) => (index === student ? false : item)));
  }

  async function saveAnswer(student: number) {
    const response = await fetch("/api/practice", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter: chapters[chapter], student, content: answers[student], sections: chapter <= 2 ? sections[student] : undefined }),
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
            ) : chapter === 1 ? (
              <div className="sectionFields literatureFields">
                {literatureTasks.map((task, taskIndex) => (
                  <section key={task.title}>
                    <div className="sectionLabel"><span>{task.number}</span><div><strong>{task.title}</strong><small>{task.subtitle}</small></div></div>
                    <ul>{task.questions.map((question) => <li key={question}>{question}</li>)}</ul>
                    <label htmlFor={`source-${index}-${taskIndex}`}>資料來源</label>
                    <input id={`source-${index}-${taskIndex}`} value={sections[index]?.[taskIndex * 2] ?? ""} onChange={(event) => updateSection(index, taskIndex * 2, event.target.value)} placeholder="資料標題、網站或書籍名稱" />
                    <label htmlFor={`literature-${index}-${taskIndex}`}>用自己的話整理</label>
                    <textarea id={`literature-${index}-${taskIndex}`} value={sections[index]?.[taskIndex * 2 + 1] ?? ""} onChange={(event) => updateSection(index, taskIndex * 2 + 1, event.target.value)} placeholder="看懂資料後，整理出和研究問題有關的重點" />
                  </section>
                ))}
              </div>
            ) : chapter === 2 ? (
              <div className="sectionFields literatureFields advancedFields">
                {citationPracticeTexts.map((practice, practiceIndex) => {
                  const field = practiceIndex * 4;
                  return (
                    <section key={practice.title}>
                      <div className="sectionLabel"><span>{practice.number}</span><div><strong>{practice.title}</strong><small>閱讀文本後，完成四個小步驟</small></div></div>
                      <div className="practiceText">
                        <strong>老師提供的文本</strong>
                        <p>{practice.text}</p>
                        <small>資料改寫自：{practice.unit}（{practice.date}），〈{practice.sourceTitle}〉</small>
                        <a href={practice.url} target="_blank" rel="noreferrer">查看原始資料</a>
                      </div>
                      <p className="citationReminder"><strong>先記住：</strong>AI 不是作者，也不是資料來源。可以請 AI 幫忙解釋，但文章中要引用原文作者或發布單位。</p>
                      <label htmlFor={`important-${index}-${practiceIndex}`}>① 我選出的重要內容</label>
                      <textarea id={`important-${index}-${practiceIndex}`} value={sections[index]?.[field] ?? ""} onChange={(event) => updateSection(index, field, event.target.value)} placeholder="這段文本最重要的是什麼？先用短句記下來。" />
                      <label htmlFor={`rewrite-${index}-${practiceIndex}`}>② 不看原文，用自己的話改寫</label>
                      <textarea id={`rewrite-${index}-${practiceIndex}`} value={sections[index]?.[field + 1] ?? ""} onChange={(event) => updateSection(index, field + 1, event.target.value)} placeholder="想像你正在向同學說明，不要照抄原句。" />
                      <label htmlFor={`intext-${index}-${practiceIndex}`}>③ 放進文章並標示來源</label>
                      <div className="citationStylePicker" aria-label="選擇引用方式">
                        <button type="button" className={citationStyles[index][practiceIndex] === "narrative" ? "active" : ""} onClick={() => setCitationStyles((current) => current.map((styles, studentIndex) => studentIndex === index ? styles.map((style, textIndex) => textIndex === practiceIndex ? "narrative" : style) : styles))}>
                          <strong>敘述式引用</strong><small>{practice.citationName}（{practice.year}）指出，……</small>
                        </button>
                        <button type="button" className={citationStyles[index][practiceIndex] === "parenthetical" ? "active" : ""} onClick={() => setCitationStyles((current) => current.map((styles, studentIndex) => studentIndex === index ? styles.map((style, textIndex) => textIndex === practiceIndex ? "parenthetical" : style) : styles))}>
                          <strong>括號式引用</strong><small>……（{practice.citationName}，{practice.year}）。</small>
                        </button>
                      </div>
                      <small className="formatHint">兩種寫法都正確，選一種完成這次練習。</small>
                      <textarea id={`intext-${index}-${practiceIndex}`} value={sections[index]?.[field + 2] ?? ""} onChange={(event) => updateSection(index, field + 2, event.target.value)} placeholder={citationStyles[index][practiceIndex] === "narrative" ? `${practice.citationName}（${practice.year}）指出，……` : `先寫自己的改寫內容（${practice.citationName}，${practice.year}）。`} />
                      <label htmlFor={`reference-${index}-${practiceIndex}`}>④ 完成參考資料</label>
                      <small className="formatHint">格式提示：作者或發布單位（年份）。文章名稱。網址（查閱日期：＿＿）</small>
                      <textarea id={`reference-${index}-${practiceIndex}`} value={sections[index]?.[field + 3] ?? ""} onChange={(event) => updateSection(index, field + 3, event.target.value)} placeholder="依照上方資料，完成一筆參考資料。" />
                    </section>
                  );
                })}
              </div>
            ) : (
              <><label htmlFor={`answer-${index}`}>{prompts[chapter]?.title ?? "我的初步想法"}</label><textarea id={`answer-${index}`} value={answers[index]} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="先想清楚本章要回答的問題，再用自己的方式組織內容。" /></>
            )}
            <footer>
              <span>{saved[index] ? "✓ 已整併並同步到雲端" : chapter <= 2 ? "儲存時會自動整併各區內容" : "尚未儲存"}</span>
              <button onClick={() => saveAnswer(index)}>儲存練習</button>
            </footer>
            {chapter <= 2 && (
              <section className="articlePreview">
                <div className="articlePreviewTitle">
                  <div><span>MERGED ARTICLE</span><strong>{chapter === 1 ? "完整文獻探討預覽" : chapter === 2 ? "進階練習成果預覽" : "完整文章預覽"}</strong></div>
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
