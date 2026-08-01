window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.weather = {
  id: "weather", number: "03", area: "EARTH", title: "天気の変化", subtitle: "雲の量と動きを記録し、根拠をもって次の天気を予想しよう",
  phases: {
    knowledge: {
      title: "雲と天気を整理", lead: "雲の量、雲の動き、気象情報の読み方を対にして整理します。",
      pairs: [
        { left: { title: "晴れ", items: ["空全体を10とした雲の量が0〜8", "雲があっても晴れの場合がある"] }, right: { title: "くもり", items: ["雲の量が9〜10", "空のほとんどが雲でおおわれる"] }, caution: "雲が一つでもあれば「くもり」ではありません。空全体にしめる雲の量で判断します。", check: { question: "空の半分ほどに雲があります。天気は？", choices: ["晴れ", "くもり", "必ず雨", "雪"], answer: 0, feedback: "雲の量が5なら0〜8の範囲なので、天気は晴れです。" } },
        { left: { title: "雲が近づく前", items: ["西の空や気象衛星画像を確認", "雨を降らせる雲の位置を見る"] }, right: { title: "雲が通り過ぎた後", items: ["雲の切れ間が広がる", "雨がやむことがある"] }, caution: "日本付近では天気が西から東へ変わることが多いですが、台風など例外もあります。", check: { question: "明日の天気を予想するため、特に見るとよい方角は？", choices: ["西の空や西側の気象情報", "真上だけ", "東だけ", "地面だけ"], answer: 0, feedback: "日本付近では雲が西から東へ動くことが多いため、西側の情報が手がかりになります。" } },
        { left: { title: "一回だけの観察", items: ["その時の雲や天気が分かる", "変化の向きは分かりにくい"] }, right: { title: "続けて行う観察", items: ["同じ場所から時刻を決めて記録", "雲の量・位置・動きを比べられる"] }, caution: "場所も時刻もばらばらだと、何が変わったのか比べにくくなります。", check: { question: "雲の動きを調べる記録として最もよいのは？", choices: ["同じ場所から時刻ごとに方角も記録", "毎回別の場所で雲の色だけ記録", "一度だけ空を見る", "気温だけ測る"], answer: 0, feedback: "同じ場所・同じ見方で時間を追うと、雲の動きを捉えられます。" } }
      ]
    },
    preparation: {
      title: "観測計画を立てる", lead: "天気の変化を調べる目的に合う観測項目を、もれなく選びます。",
      scenarios: [
        { id: "cloud-change", mode: "select", question: "午前から午後までの雲の変化を調べたい", instruction: "毎回記録する項目をすべて選ぼう", correct: ["time", "weather", "amount", "direction", "same-place"], options: [
          { id: "time", name: "時刻", detail: "いつの記録か残す" }, { id: "weather", name: "天気", detail: "晴れ・くもり・雨を記録" }, { id: "amount", name: "雲の量", detail: "空全体を10として記録" }, { id: "direction", name: "雲の位置と動く方角", detail: "方位もいっしょに記録" }, { id: "same-place", name: "同じ観測場所", detail: "同じ見え方で比べる" }, { id: "clothes", name: "観察者の服の色", detail: "雲の変化には使わない" }
        ], success: "時刻・天気・雲量・方角を同じ場所から記録すると、雲の変化と天気を結び付けられます。" },
        { id: "tomorrow", mode: "select", question: "明日の天気を予想したい", instruction: "必要な情報をすべて選ぼう", correct: ["west", "satellite", "rain-map", "latest"], options: [
          { id: "west", name: "西の地域の天気", detail: "これから近づく天気の手がかり" }, { id: "satellite", name: "気象衛星の雲画像", detail: "雲の広がりと動きを見る" }, { id: "rain-map", name: "雨雲の動き", detail: "雨の範囲と進む向きを見る" }, { id: "latest", name: "新しい時刻の情報", detail: "連続した画像で変化を見る" }, { id: "yesterday-only", name: "昨日の朝だけの空", detail: "現在の雲の動きが分からない" }, { id: "east-only", name: "東に去った雲だけ", detail: "次に来る雲の手がかりになりにくい" }
        ], success: "西側の天気と、連続した雲・雨の情報を組み合わせると、根拠ある予想になります。" },
        { id: "fair-compare", mode: "select", question: "二日間の天気の変化を公平に比べたい", instruction: "そろえる記録方法をすべて選ぼう", correct: ["place", "times", "view", "items"], options: [
          { id: "place", name: "観測場所", detail: "同じ場所から見る" }, { id: "times", name: "観測する時刻", detail: "同じ時刻ごとに比べる" }, { id: "view", name: "見る方角と空の範囲", detail: "同じ範囲を観察" }, { id: "items", name: "記録項目", detail: "雲量・天気などを統一" }, { id: "observer", name: "観察する人の身長", detail: "天気の変化には不要" }
        ], success: "場所・時刻・見る範囲・記録項目をそろえると、二日間の違いを正しく比べられます。" }
      ]
    },
    consideration: {
      title: "雲から天気を予想", lead: "時間順の気象情報を読み、予想の根拠と限界を考えます。",
      questions: [
        { id: "cloud-amount", prompt: "観測した雲の量が『8』でした。天気の記録は？", choices: ["晴れ", "くもり", "必ず雨", "観測不能"], answer: 0, feedback: "小学校の観測では、雲の量0〜8を晴れ、9〜10をくもりとします。" },
        { id: "west-east", prompt: "午前9時に大阪付近にあった広い雨雲が、正午には名古屋付近へ移りました。進んだ向きは？", visual: { type: "timeline", items: ["9時　大阪付近", "12時　名古屋付近"] }, choices: ["西から東", "東から西", "南から北", "動いていない"], answer: 0, feedback: "大阪から名古屋への移動は、おおよそ西から東です。" },
        { id: "forecast", prompt: "自分の地域の西側に雨雲があり、東へ進んでいます。数時間後の予想として最もよいのは？", choices: ["雨になる可能性が高い", "必ず一週間雨が続く", "雲は絶対に消える", "気温だけで晴れる"], answer: 0, feedback: "雲の位置と動きから雨の可能性は予想できますが、「必ず」や長期間までは言い切れません。" },
        { id: "exception", label: "言えること／言えないこと", prompt: "『日本の天気はいつでも必ず西から東へ変わる』と言える？", choices: ["言える", "言えない"], answer: 1, feedback: "西から東へ変わることが多いという規則性です。台風など、違う動きをする場合もあります。" },
        { id: "evidence", prompt: "明日の天気予想に最も説得力がある説明は？", choices: ["西の雨雲が連続画像で東へ進んでいるので、明日は雨になると考えた", "何となく雨だと思う", "昨日が雨だったから必ず雨", "雲を一度見ただけで一週間雨"], answer: 0, feedback: "位置・向き・時間変化という観測事実を根拠にした予想が適切です。" }
      ]
    }
  },
  completion: "天気は雲の量や動きと関係しています。同じ見方で続けて観測し、複数の気象情報を根拠に予想することが大切です。"
};
