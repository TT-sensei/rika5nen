window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.solutions = {
  id: "solutions", number: "05", area: "MATTER", title: "物のとけ方", subtitle: "水の量・温度・物の種類を一つずつ変え、とけ方の規則を見つけよう",
  phases: {
    knowledge: {
      title: "とける現象を整理", lead: "『見えなくなる』ことと『なくなる』こと、とける量の限界や取り出し方を対にして整理します。",
      pairs: [
        { left: { title: "水にとけた状態", items: ["液全体に広がって透明になる", "時間がたっても底にたまらない", "食塩はなくなっていない"] }, right: { title: "水にとけきれない状態", items: ["一定量をこえると底に残る", "水の量や温度で限界が変わる"] }, caution: "目に見えなくなっても、物がなくなったわけではありません。水溶液の中にあります。", check: { question: "食塩が水にとけて見えなくなりました。食塩は？", choices: ["水溶液の中にある", "消えてなくなった", "空気になった", "容器の外へ出た"], answer: 0, feedback: "とけた食塩は液全体に広がり、見えなくなっても水溶液の中にあります。" } },
        { left: { title: "食塩", items: ["水温を上げても、とける量の増え方は小さい", "水を蒸発させると取り出せる"] }, right: { title: "ミョウバン", items: ["水温を上げると、とける量が大きく増える", "冷やすと結晶が出やすい"] }, caution: "どの物も、温度を上げれば同じ割合でたくさんとけるわけではありません。物の種類で違います。", check: { question: "水温を上げたとき、とける量が大きく増えるのは？", choices: ["ミョウバン", "食塩", "どちらも必ず同じ", "どちらも0g"], answer: 0, feedback: "ミョウバンは温度による変化が大きく、食塩は比較的小さいです。" } },
        { left: { title: "とける前", items: ["水の質量＋とかす物の質量", "例：水100g＋食塩20g"] }, right: { title: "とけた後", items: ["水溶液の質量は合計と同じ", "例：120g", "ふたをしてこぼさなければ質量は保たれる"] }, caution: "見えなくなることと、質量がなくなることを混同しないようにしよう。", check: { question: "水100gに食塩20gを完全にとかした水溶液の質量は？", choices: ["120g", "100g", "80g", "20g"], answer: 0, feedback: "こぼれたり外へ出たりしなければ、質量は100＋20＝120gです。" } }
      ]
    },
    preparation: {
      title: "とかす実験を組み立てる", lead: "水の量・温度・物の種類のうち、調べたい条件だけを変えます。",
      scenarios: [
        { id: "solution-water", question: "水の量で、食塩のとける量が変わるか調べたい", change: ["water-amount"], controls: ["temperature", "solute", "stir", "add-unit"], conditions: [
          { id: "water-amount", name: "水の量", detail: "50mL・100mLを比べる" }, { id: "temperature", name: "水の温度", detail: "同じ温度にする" }, { id: "solute", name: "とかす物", detail: "どちらも食塩" }, { id: "stir", name: "かき混ぜ方", detail: "同じ時間・回数" }, { id: "add-unit", name: "一度に加える量", detail: "同じ量ずつ加える" }
        ], success: "水の量だけを変えれば、水量と食塩のとける量を関係付けられます。" },
        { id: "solution-temperature", question: "水の温度で、ミョウバンのとける量が変わるか調べたい", change: ["temperature"], controls: ["water-amount", "solute", "stir", "add-unit"], conditions: [
          { id: "temperature", name: "水の温度", detail: "20℃・60℃を比べる" }, { id: "water-amount", name: "水の量", detail: "どちらも50mL" }, { id: "solute", name: "とかす物", detail: "どちらもミョウバン" }, { id: "stir", name: "かき混ぜ方", detail: "同じ時間・回数" }, { id: "add-unit", name: "一度に加える量", detail: "同じ量ずつ加える" }
        ], success: "温度だけを変え、同じ水量に同じ物を加えると、温度との関係を比べられます。" },
        { id: "solution-kind", question: "物の種類で、とける量が違うか調べたい", change: ["solute"], controls: ["water-amount", "temperature", "stir", "add-unit"], conditions: [
          { id: "solute", name: "とかす物", detail: "食塩・ミョウバンを比べる" }, { id: "water-amount", name: "水の量", detail: "どちらも同じ量" }, { id: "temperature", name: "水の温度", detail: "どちらも同じ温度" }, { id: "stir", name: "かき混ぜ方", detail: "同じ時間・回数" }, { id: "add-unit", name: "一度に加える量", detail: "同じ量ずつ加える" }
        ], success: "物の種類だけを変えると、食塩とミョウバンのとけ方の違いを公平に比べられます。" },
        { id: "solution-mass", question: "物がとける前後で全体の質量が変わるか調べたい", change: ["dissolve"], controls: ["water-amount", "solute-amount", "container", "no-loss"], conditions: [
          { id: "dissolve", name: "とける前・とけた後", detail: "同じセットを前後で測る" }, { id: "water-amount", name: "水の量", detail: "途中で水を加えない" }, { id: "solute-amount", name: "食塩の量", detail: "途中で食塩を加えない" }, { id: "container", name: "容器", detail: "同じ容器ごと測る" }, { id: "no-loss", name: "外へ出さない", detail: "ふたをして、こぼさない" }
        ], success: "同じ閉じたセットを前後で測れば、とけても全体の質量が保たれることを確かめられます。" }
      ]
    },
    consideration: {
      title: "数値とグラフから考える", lead: "とける量と質量のデータを読み、実験していないことまで言いすぎないようにします。",
      questions: [
        { id: "mass", prompt: "水100gと食塩15gをふた付き容器に入れ、とかしました。全体の質量は？", visual: { type: "table", headers: ["水", "食塩", "合計"], rows: [["100g", "15g", "? g"]] }, choices: ["115g", "100g", "85g", "15g"], answer: 0, feedback: "とけても食塩は水溶液の中にあるため、全体は115gです。" },
        { id: "water-double", prompt: "20℃の水50mLに食塩が18gまでとけました。同じ温度の水100mLでは、およそ何gとけると考えられる？", choices: ["36g", "18g", "68g", "100g"], answer: 0, feedback: "同じ温度なら、水の量が2倍になると、とける量もおよそ2倍になります。" },
        { id: "graph", prompt: "50mLの水にとけたミョウバンの量です。グラフから言えることは？", visual: { type: "bars", max: 30, unit: "g", bars: [{ label: "20℃", value: 6 }, { label: "60℃", value: 28 }] }, choices: ["この範囲では温度が高い方が多くとけた", "温度が高いと質量がなくなる", "どんな物も必ず28gとける", "水の量が増えた"], answer: 0, feedback: "同じ水量・同じ物なので、温度ととける量の関係を考えられます。" },
        { id: "retrieve", prompt: "60℃の水に多くとかしたミョウバンを取り出したい。適した方法は？", choices: ["水溶液を冷やす", "さらに熱い水を加える", "ずっとかき混ぜるだけ", "食塩を加える"], answer: 0, feedback: "ミョウバンは温度が下がると、とけていられる量が減り、結晶として出てきます。" },
        { id: "overclaim", label: "言えること／言えないこと", prompt: "食塩とミョウバンの結果から『すべての物は温度を上げれば同じだけ多くとける』と言える？", choices: ["言える", "言えない"], answer: 1, feedback: "とける量や温度による変化は物の種類で違います。二つの物だけから、すべてについては言えません。" }
      ]
    }
  },
  completion: "物が水にとけても質量は保たれます。とける量は水の量・温度・物の種類に関係するため、一つずつ条件を変えて調べます。"
};
