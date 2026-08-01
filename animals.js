window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.animals = {
  id: "animals",
  number: "02",
  area: "LIFE",
  title: "メダカ・人のたんじょう",
  subtitle: "観察する場所と時間の変化に注目して、生命の育ちを追おう",
  phases: {
    knowledge: {
      title: "ちがいと変化を整理",
      lead: "メダカの雄と雌、卵の中の変化、魚と人の育ち方を対にして整理します。",
      pairs: [
        {
          left: { title: "メダカの雄", items: ["背びれに切れこみがある", "しりびれが大きく、平行四辺形に近い"] },
          right: { title: "メダカの雌", items: ["背びれに切れこみがない", "しりびれが小さく、後ろが短い"] },
          caution: "体の大きさや色だけでは、雄と雌を正確に見分けにくいです。背びれとしりびれを観察しよう。",
          check: { question: "メダカの雄と雌を見分けるとき、特に見るところは？", choices: ["背びれとしりびれ", "目と口", "うろこの色だけ", "尾びれの長さだけ"], answer: 0, feedback: "雄は背びれの切れこみと、大きなしりびれが目印です。" }
        },
        {
          left: { title: "受精したばかりの卵", items: ["中は一つの細胞から始まる", "細胞が分かれて数を増やす"] },
          right: { title: "かえる前の卵", items: ["目や心臓、体の形が見える", "体を動かすようになる"] },
          caution: "卵の中に小さな魚が最初から入っているのではありません。日がたつにつれて体がつくられます。",
          check: { question: "受精卵の中で初めに起こる変化は？", choices: ["細胞が分かれて数が増える", "すぐにひれが完成する", "えさを食べ始める", "卵の外を泳ぐ"], answer: 0, feedback: "受精卵は細胞分裂をくり返し、だんだん体の形ができます。" }
        },
        {
          left: { title: "メダカ", items: ["卵は水中で育つ", "卵の中の養分で育つ", "卵からかえる"] },
          right: { title: "人", items: ["母親の子宮の中で育つ", "胎盤とへその緒を通して養分などを受け取る", "約38週で生まれる"] },
          caution: "人の赤ちゃんは母親が食べた物をそのまま食べるのではなく、胎盤とへその緒を通して養分や酸素を受け取ります。",
          check: { question: "人の胎児が育つ場所は？", choices: ["母親の子宮", "胃", "肺", "心臓"], answer: 0, feedback: "人の受精卵は子宮の中で胎児へと育ちます。" }
        }
      ]
    },
    preparation: {
      title: "観察計画を立てる",
      lead: "目的に合う観察ポイントをすべて選びます。見なくてもよいことを増やしすぎないのも大切です。",
      scenarios: [
        {
          id: "medaka-sex", mode: "select", question: "メダカの雄と雌を見分けたい",
          instruction: "見る場所・見方をすべて選ぼう", correct: ["dorsal", "anal", "side"],
          options: [
            { id: "dorsal", name: "背びれ", detail: "切れこみがあるかを見る" },
            { id: "anal", name: "しりびれ", detail: "形と大きさを見る" },
            { id: "side", name: "横から観察", detail: "透明な容器で静かに見る" },
            { id: "color", name: "体の色だけ", detail: "色のこさだけで決める" },
            { id: "speed", name: "泳ぐ速さ", detail: "速い方を雄と決める" }
          ],
          success: "背びれ・しりびれを横から観察すれば、体を傷つけずに雌雄を見分けられます。"
        },
        {
          id: "egg-growth", mode: "select", question: "受精卵が日ごとにどう変わるか調べたい",
          instruction: "記録することをすべて選ぼう", correct: ["date", "temperature", "drawing", "magnification"],
          options: [
            { id: "date", name: "日付と時刻", detail: "いつの変化か分かるようにする" },
            { id: "temperature", name: "水温", detail: "育ち方に関係する条件を記録" },
            { id: "drawing", name: "見えた形のスケッチ", detail: "目・心臓・体などを同じ向きで記録" },
            { id: "magnification", name: "倍率", detail: "毎回同じ見え方で比べる" },
            { id: "egg-color-only", name: "卵の色だけ", detail: "形の変化は記録しない" },
            { id: "shake", name: "容器を振る", detail: "動くか確かめる" }
          ],
          success: "時間・水温・倍率を記録し、同じ見方でスケッチすると、成長の順序を比べられます。"
        },
        {
          id: "human-data", mode: "select", question: "人の胎児がどのように成長するか資料で調べたい",
          instruction: "比べる資料の項目をすべて選ぼう", correct: ["weeks", "length", "mass", "features"],
          options: [
            { id: "weeks", name: "受精からの週数", detail: "時間の順序をそろえる" },
            { id: "length", name: "体の大きさ", detail: "成長による変化を比べる" },
            { id: "mass", name: "体の重さ", detail: "増え方を比べる" },
            { id: "features", name: "体の形や器官", detail: "手足などができる時期を見る" },
            { id: "birthday", name: "母親の誕生日", detail: "胎児の成長とは直接関係しない" },
            { id: "favorite", name: "好きな食べ物", detail: "資料の成長比較には使わない" }
          ],
          success: "週数を軸に、大きさ・重さ・体の形を比べると、胎児の成長を時間順に捉えられます。"
        }
      ]
    },
    consideration: {
      title: "成長の順序を考える",
      lead: "観察結果や資料を時間順に読み、そこから言えることを選びます。",
      questions: [
        { id: "medaka-feature", prompt: "背びれに切れこみがあり、しりびれが大きく平行四辺形に近いメダカです。どちら？", visual: { type: "cards", items: ["背びれ：切れこみあり", "しりびれ：大きい"] }, choices: ["雄", "雌", "卵", "この情報では魚かどうかも分からない"], answer: 0, feedback: "2つのひれの特徴が雄の目印と一致します。" },
        { id: "egg-order", label: "時系列", prompt: "メダカの受精卵の変化として正しい順序は？", choices: ["細胞が増える → 目や心臓が見える → 体を動かす → ふ化", "目が見える → 細胞が増える → ふ化 → 心臓", "ふ化 → 細胞が増える → 目が見える", "心臓 → 受精 → 細胞が一つになる"], answer: 0, feedback: "受精卵は細胞分裂から始まり、器官や体の形ができて、最後にふ化します。" },
        { id: "temperature-claim", prompt: "水温が違う二つの水そうで、ふ化までの日数が違いました。「日数の差は水温だけが原因」と言える？", choices: ["ほかの条件も同じなら言える", "いつでも必ず言える", "水温は絶対に関係しない", "卵の数だけ見れば言える"], answer: 0, feedback: "水温以外の条件をそろえて初めて、水温との関係を考えられます。" },
        { id: "human-order", label: "時系列", prompt: "人の育ち方として正しい順序は？", choices: ["受精卵 → 胎児 → 子宮の中で成長 → 誕生", "胎児 → 受精卵 → 誕生 → 子宮", "誕生 → 受精卵 → 胎児", "受精卵 → 誕生 → 胎児"], answer: 0, feedback: "受精卵は子宮の中で胎児へ成長してから生まれます。" },
        { id: "life-conclusion", prompt: "メダカと人の育ち方を比べて、共通して言えることは？", choices: ["どちらも受精卵から始まり、時間とともに体がつくられる", "どちらも水中の卵からふ化する", "どちらも母親の子宮で育つ", "どちらも生まれるまで変化しない"], answer: 0, feedback: "育つ場所や養分の得方は違っても、受精卵から成長する点は共通です。" }
      ]
    }
  },
  completion: "生命は受精卵から始まり、時間とともに体のつくりが整います。観察では、見る場所と記録する時点をそろえることが大切です。"
};
