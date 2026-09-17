import "./results.css";

type BarItem = { label: string; value: number };

const understandingSelf: BarItem[] = [
  { label: "完全不了解", value: 6.0 },
  { label: "不太了解", value: 32.2 },
  { label: "有些了解", value: 53.6 },
  { label: "非常了解", value: 7.7 },
  { label: "無法判斷", value: 0.5 },
];

const harmfulAwareness: BarItem[] = [
  { label: "聽過，也大致了解其中至少一種物質", value: 30.1 },
  { label: "聽過，但不太了解", value: 51.4 },
  { label: "沒有聽過", value: 14.2 },
  { label: "不確定", value: 4.4 },
];

const knowledgeRows = [
  { label: "原料受到污染，可能影響成品安全", overall: 84.6, student: 76.1, adult: 100.0 },
  { label: "某些有害物質可能在製作過程中形成", overall: 72.0, student: 59.8, adult: 93.8 },
  { label: "長時間反覆加熱可能影響油品品質", overall: 59.9, student: 43.6, adult: 89.2 },
  { label: "不能只看是否精製，就判斷哪款油較安全", overall: 38.5, student: 25.6, adult: 61.5 },
];

const attitudeRows = [
  { label: "對市售食用油的安全感到放心", agree: 42.9, disagree: 38.5, neutral: 18.7 },
  { label: "願意花時間學習食用油安全知識", agree: 84.2, disagree: 4.9, neutral: 10.9 },
  { label: "看到食安新聞時，會擔心家中的油是否安全", agree: 88.5, disagree: 4.9, neutral: 6.6 },
];

const decisionItems: BarItem[] = [
  { label: "包裝上的成分、有效日期等標示", value: 71.8 },
  { label: "品牌或廠商的信譽", value: 42.0 },
  { label: "產品提供的檢驗資料", value: 37.4 },
  { label: "政府公布的查驗資訊", value: 33.3 },
  { label: "新聞或網路資訊", value: 32.2 },
  { label: "油的顏色或氣味", value: 24.1 },
];

const informationItems: BarItem[] = [
  { label: "電視、報紙或新聞網站", value: 63.6 },
  { label: "社群媒體或通訊軟體", value: 43.2 },
  { label: "政府機關網站或宣導資料", value: 33.0 },
  { label: "家人或親友", value: 30.7 },
  { label: "食用油包裝", value: 19.9 },
  { label: "老師或學校課程", value: 17.6 },
  { label: "廣告或商家介紹", value: 13.1 },
];

const learningItems: BarItem[] = [
  { label: "有害物質可能如何影響健康", value: 56.1 },
  { label: "有害物質可能從哪裡來", value: 54.4 },
  { label: "製作過程如何影響油品安全", value: 50.6 },
  { label: "如何選購食用油", value: 34.4 },
  { label: "如何判斷食安消息是否可信", value: 30.6 },
  { label: "如何保存及使用食用油", value: 18.9 },
  { label: "目前沒有想了解的內容", value: 7.8 },
];

function Percent({ value }: { value: number }) {
  return <>{value.toFixed(1)}%</>;
}

function HorizontalBars({ items, label, tone = "green" }: { items: BarItem[]; label: string; tone?: "green" | "orange" }) {
  return (
    <div className={`horizontalBars ${tone}`} role="img" aria-label={label}>
      {items.map((item) => (
        <div className="barRow" key={item.label}>
          <div className="barMeta"><span>{item.label}</span><strong><Percent value={item.value} /></strong></div>
          <div className="barTrack"><i style={{ width: `${item.value}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeComparison() {
  return (
    <div className="comparisonChart" role="img" aria-label="四項知識題的學生與成人正確率比較">
      <div className="chartLegend"><span className="studentKey">學生</span><span className="adultKey">成人</span></div>
      {knowledgeRows.map((row) => (
        <div className="comparisonRow" key={row.label}>
          <strong>{row.label}</strong>
          <div className="comparisonLine student"><span>學生</span><div><i style={{ width: `${row.student}%` }} /></div><b><Percent value={row.student} /></b></div>
          <div className="comparisonLine adult"><span>成人</span><div><i style={{ width: `${row.adult}%` }} /></div><b><Percent value={row.adult} /></b></div>
        </div>
      ))}
    </div>
  );
}

function ResultSection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="resultSection" id={id}>
      <header><span>{number}</span><h2>{title}</h2></header>
      {children}
    </section>
  );
}

export default function ResultsPage() {
  return (
    <main className="resultsPage">
      <header className="resultsTopbar">
        <a href="/collab" className="resultsBack">← 返回正式共編</a>
        <a href="/" className="resultsBrand"><span>研</span><div><strong>食用油安全認知研究</strong><small>六年一班小論文研究</small></div></a>
        <div className="resultsTopActions"><a href="/sources">資料收集區</a><a href="/collab">共同正式稿</a></div>
      </header>

      <section className="resultsHero">
        <div>
          <p className="eyebrow">CHAPTER 4 · RESEARCH RESULTS</p>
          <h1>四、研究結果與討論</h1>
          <p>我們用問卷了解大家對食用油安全知道多少、會參考哪些資訊，以及最想學習哪些內容。</p>
        </div>
        <div className="sampleSummary" aria-label="問卷樣本概況">
          <div><strong>183</strong><span>份問卷</span></div>
          <div><strong>118</strong><span>位學生</span></div>
          <div><strong>65</strong><span>位成人</span></div>
        </div>
      </section>

      <nav className="resultsNav" aria-label="研究結果六節導覽">
        <a href="#result-1"><span>01</span>了解情形</a>
        <a href="#result-2"><span>02</span>知識比較</a>
        <a href="#result-3"><span>03</span>態度看法</a>
        <a href="#result-4"><span>04</span>判斷依據</a>
        <a href="#result-5"><span>05</span>資訊來源</a>
        <a href="#result-6"><span>06</span>學習需求</a>
      </nav>

      <div className="resultsContent">
        <section className="resultsOpening">
          <p>我們共收到183份問卷，其中學生118人，成人65人。透過問卷，我們了解大家對食用油安全知道多少、會參考哪些資訊，以及最想學習哪些內容。</p>
          <details className="methodNote">
            <summary>查看資料整理方式</summary>
            <div>
              <p>本頁使用9月14日至9月16日共183份回覆的資料快照，其中學生118人、成人65人。</p>
              <p>四個知識題各有182份有效作答，其中學生117人、成人65人；「放心」題有182份，其餘態度題有183份。</p>
              <p>知識第4及第5題曾經改版，因此沒有把前後不同版本混算成六題總分。</p>
              <p>三題複選題分別排除9、7、3筆互相矛盾的選答，各題有效資料為174、176、180份。只有該題不列入計算，原始問卷仍完整保留。</p>
            </div>
          </details>
        </section>

        <ResultSection id="result-1" number="01" title="多數人聽過食用油安全問題，但不一定了解內容">
          <div className="chartPair">
            <article className="chartCard"><h3>自己認為了解多少</h3><HorizontalBars items={understandingSelf} label="受訪者自評食用油安全了解程度" /></article>
            <article className="chartCard"><h3>是否聽過有害物質</h3><HorizontalBars items={harmfulAwareness} label="受訪者是否聽過食用油可能含有有害物質" tone="orange" /></article>
          </div>
          <div className="tableWrap">
            <table><caption>表4-1　受訪者對食用油安全的了解情形</caption><thead><tr><th>調查項目</th><th>回答內容</th><th>百分比</th></tr></thead><tbody>
              {understandingSelf.map((row, index) => <tr key={row.label}>{index === 0 && <th rowSpan={understandingSelf.length}>自己認為對食用油安全問題了解多少</th>}<td>{row.label}</td><td><Percent value={row.value} /></td></tr>)}
              {harmfulAwareness.map((row, index) => <tr key={row.label}>{index === 0 && <th rowSpan={harmfulAwareness.length}>是否聽過食用油可能含有有害物質</th>}<td>{row.label}</td><td><Percent value={row.value} /></td></tr>)}
            </tbody></table>
          </div>
          <div className="discussion"><p>從表4-1可以看出，超過一半的人認為自己對食用油安全「有些了解」（53.6%）。但是，問到食用油中的有害物質時，最多人選擇「聽過，但不太了解」（51.4%），只有30.1%表示大致了解其中至少一種物質。</p><p>我們發現，「聽過消息」和「了解內容」並不一樣。大家可能聽過食用油發生問題，卻不一定清楚問題是怎麼產生的。因此，除了了解大家是否接觸過相關消息，我們也透過知識題，進一步了解大家知道哪些食用油安全知識。</p></div>
        </ResultSection>

        <ResultSection id="result-2" number="02" title="大家較了解原料污染，對反覆加熱和精製的認識較少">
          <article className="chartCard wide"><h3>學生與成人正確率比較</h3><KnowledgeComparison /></article>
          <div className="tableWrap">
            <table><caption>表4-2　學生與成人在四項食用油安全知識的正確率</caption><thead><tr><th>知識內容摘要</th><th>全體正確率</th><th>學生正確率</th><th>成人正確率</th></tr></thead><tbody>
              {knowledgeRows.map((row) => <tr key={row.label}><th>{row.label}</th><td><Percent value={row.overall} /></td><td><Percent value={row.student} /></td><td><Percent value={row.adult} /></td></tr>)}
            </tbody></table>
          </div>
          <div className="discussion"><p>從表4-2可以看出，原料污染題的正確率最高，為84.6%；其次是製作過程中可能形成有害物質，正確率為72.0%。反覆加熱題的正確率為59.9%，精製判斷題則只有38.5%。</p><p>在精製判斷題中，有44人認為精製能去除所有有害物質，另有50人回答「不知道」。精製是去除部分雜質的加工過程，但題目只告訴我們是否精製，還不足以判斷哪款油比較安全，也需要了解原料品質和製作管理等情況。</p><p>成人在這四題的正確率都比學生高。其中，學生在反覆加熱和精製判斷兩題，答對的人都不到一半。我們認為，這兩部分是學生比較需要進一步了解的內容，適合在食用油安全課程中多加說明。</p></div>
        </ResultSection>

        <ResultSection id="result-3" number="03" title="多數人會擔心食用油安全，也願意學習">
          <article className="chartCard wide"><h3>同意或非常同意的比例</h3><HorizontalBars items={attitudeRows.map((row) => ({ label: row.label, value: row.agree }))} label="受訪者對三項食用油安全看法表示同意或非常同意的比例" /></article>
          <div className="tableWrap">
            <table><caption>表4-3　受訪者對食用油安全的看法</caption><thead><tr><th>調查內容</th><th>同意或非常同意</th><th>不同意或非常不同意</th><th>沒有想法</th></tr></thead><tbody>
              {attitudeRows.map((row) => <tr key={row.label}><th>{row.label}</th><td><Percent value={row.agree} /></td><td><Percent value={row.disagree} /></td><td><Percent value={row.neutral} /></td></tr>)}
            </tbody></table>
          </div>
          <div className="discussion"><p>從表4-3可以看出，88.5%的人看到食用油安全新聞時，會擔心家中的油是否安全，也有84.2%願意花時間學習相關知識。相較之下，對市售食用油感到放心的人占42.9%，不到一半。</p><p>把這個結果和知識題一起看，我們發現，大家雖然關心食用油安全，卻仍有一些不清楚的地方。因此，介紹食安知識時，除了提醒大家注意問題，也可以進一步說明原因，幫助大家了解新聞中的內容，而不只是感到擔心。</p></div>
        </ResultSection>

        <ResultSection id="result-4" number="04" title="包裝標示是最常使用的安全判斷依據">
          <article className="chartCard wide"><h3>判斷食用油安全的前六項依據</h3><HorizontalBars items={decisionItems} label="受訪者判斷食用油安全的前六項依據" tone="orange" /></article>
          <div className="tableWrap">
            <table><caption>表4-4　受訪者判斷食用油安全的前六項依據</caption><thead><tr><th>判斷依據（可複選）</th><th>百分比</th></tr></thead><tbody>{decisionItems.map((row) => <tr key={row.label}><th>{row.label}</th><td><Percent value={row.value} /></td></tr>)}</tbody></table>
          </div>
          <div className="discussion"><p>從表4-4可以看出，大家最常依據包裝上的成分、有效日期等標示判斷食用油安全，占71.8%；其次是品牌或廠商的信譽，占42.0%。產品提供的檢驗資料和政府公布的查驗資訊，也有超過三成的人選擇。</p><p>我們發現，包裝標示是大家經常參考的資訊。因此，學習食用油安全時，可以從生活中常見的油品包裝開始，練習閱讀標示。不過，這次問卷沒有測試大家是否看得懂這些資料，所以還不能確定大家能不能正確解讀。</p></div>
        </ResultSection>

        <ResultSection id="result-5" number="05" title="新聞和社群媒體是主要的食用油安全資訊來源">
          <article className="chartCard wide"><h3>接觸食用油安全資訊的管道</h3><HorizontalBars items={informationItems} label="受訪者接觸食用油安全資訊的管道" /></article>
          <div className="tableWrap">
            <table><caption>表4-5　受訪者接觸食用油安全資訊的管道</caption><thead><tr><th>資訊來源（可複選）</th><th>百分比</th></tr></thead><tbody>{informationItems.map((row) => <tr key={row.label}><th>{row.label}</th><td><Percent value={row.value} /></td></tr>)}</tbody></table>
          </div>
          <div className="discussion"><p>從表4-5可以看出，最多人透過電視、報紙或新聞網站接觸食用油安全資訊，占63.6%；其次是社群媒體或通訊軟體，占43.2%。</p><p>我們認為，既然新聞和網路是大家常接觸資訊的地方，學習時就可以用相關報導當例子，練習找出消息來源、看懂內容，並想一想還有哪些事情需要查清楚。這樣遇到不熟悉的食安消息時，就能知道可以從哪裡開始了解。</p></div>
        </ResultSection>

        <ResultSection id="result-6" number="06" title="大家最想知道有害物質如何影響健康，以及從哪裡來">
          <article className="chartCard wide"><h3>最想了解的食用油安全內容</h3><HorizontalBars items={learningItems} label="受訪者想了解的食用油安全內容" tone="orange" /></article>
          <div className="tableWrap">
            <table><caption>表4-6　受訪者想了解的食用油安全內容</caption><thead><tr><th>想了解的內容（可複選）</th><th>百分比</th></tr></thead><tbody>{learningItems.map((row) => <tr key={row.label}><th>{row.label}</th><td><Percent value={row.value} /></td></tr>)}</tbody></table>
          </div>
          <div className="discussion"><p>從表4-6可以看出，大家最想了解的是有害物質對健康的影響，占56.1%；其次是有害物質的來源，占54.4%；第三是製作過程如何影響油品安全，占50.6%。</p><p>在最後的自由回答中，也有人詢問有害物質如何形成、如何買到安全的食用油，以及食用油可能對身體造成什麼影響。這些問題和前面的選答結果相呼應。</p><p>我們發現，大家想知道的不只是「哪一款油可以買」，也想了解「問題從哪裡來」和「為什麼會影響健康」。因此，食用油安全的學習內容可以從原料、製作到使用方式逐步介紹，不必只限於新聞中出現的某一種物質。</p></div>
        </ResultSection>

        <section className="overallConclusion"><p className="eyebrow">整體發現</p><p>整體來看，這次受訪的學生與成人大多關心食用油安全，也願意學習，但對部分知識仍不清楚。我們認為，食安教育除了讓大家注意相關消息，更需要幫助大家理解消息背後的原因，學習如何進一步查找和判斷資訊。</p></section>
      </div>
    </main>
  );
}
