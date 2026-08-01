window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.plants = {
  id: "plants",
  number: "01",
  area: "LIFE",
  title: "植物の発芽と成長",
  subtitle: "インゲンマメを研究して、植物の一生を読み解こう",
  phases: {
    knowledge: {
      title: "くらべて整理",
      lead: "よく似た知識を左右に並べて、ちがいをつかもう。暗記よりも、次の実験で使えることが目標です。",
      pairs: [
        {
          left: { title: "発芽に必要な条件", items: ["水", "空気", "発芽に適した温度"] },
          right: { title: "成長に関係する条件", items: ["日光", "肥料など"] },
          caution: "日光や肥料は「発芽の3条件」には入りません。発芽と、その後の成長を分けて考えよう。",
          check: {
            question: "種子が発芽するために必要な3つの条件はどれ？",
            choices: ["水・空気・適した温度", "水・日光・肥料", "日光・空気・肥料", "水・土・日光"],
            answer: 0,
            feedback: "発芽には水・空気・適した温度が必要です。土や日光、肥料がなくても、条件がそろえば発芽できます。"
          }
        },
        {
          left: { title: "発芽する前", items: ["子葉にでんぷんが多い", "種子の中の養分をたくわえている"] },
          right: { title: "発芽した後", items: ["でんぷんが少なくなる", "養分を使って根や芽をのばす"] },
          caution: "ヨウ素液が青むらさき色になると、でんぷんがあると判断できます。色がこいほど量が多いとは、この実験だけでは言い切れません。",
          check: {
            question: "発芽した後、子葉のでんぷんが少なくなるのはなぜ？",
            choices: ["成長するために使われたから", "水に全部とけたから", "空気中に出ていったから", "日光で消えたから"],
            answer: 0,
            feedback: "種子は、たくわえていたでんぷんなどの養分を使って発芽し、初めの成長をします。"
          }
        },
        {
          left: { title: "受粉した花", items: ["花粉がめしべの先につく", "めしべのもとが実になる", "実の中に種子ができる"] },
          right: { title: "受粉していない花", items: ["実ができにくい", "花粉をつけない実験では袋をかぶせる"] },
          caution: "花粉がめしべの先につくことを受粉といいます。花粉ができるのはおしべです。",
          check: {
            question: "受粉すると、花のどこが実になる？",
            choices: ["めしべのもと", "めしべの先", "おしべ", "花びら"],
            answer: 0,
            feedback: "花粉がめしべの先につくと、めしべのもとが実になり、その中に種子ができます。"
          }
        }
      ]
    },
    preparation: {
      title: "実験を組み立てる",
      lead: "調べたい条件だけを変え、ほかは同じにします。カードを「変える」「そろえる」に分けよう。",
      scenarios: [
        {
          id: "germination-water",
          question: "発芽に水が必要か調べたい",
          change: ["water"],
          controls: ["air", "temperature", "seed-kind", "seed-count"],
          conditions: [
            { id: "water", name: "水", detail: "一方だけ水をあたえない" },
            { id: "air", name: "空気", detail: "どちらも空気にふれさせる" },
            { id: "temperature", name: "温度", detail: "どちらも同じ室温にする" },
            { id: "seed-kind", name: "種子の種類", detail: "同じ種類・同じくらいの大きさ" },
            { id: "seed-count", name: "種子の数", detail: "どちらも同じ数にする" }
          ],
          success: "水だけを変えて、ほかを同じにできました。結果にちがいが出たら、水が関係したと考えられます。"
        },
        {
          id: "germination-temperature",
          question: "発芽に適した温度が必要か調べたい",
          change: ["temperature"],
          controls: ["water", "air", "seed-kind", "seed-count"],
          conditions: [
            { id: "temperature", name: "温度", detail: "室温と冷ぞう庫の中で比べる" },
            { id: "water", name: "水", detail: "どちらにも同じ量をあたえる" },
            { id: "air", name: "空気", detail: "どちらも空気にふれさせる" },
            { id: "seed-kind", name: "種子の種類", detail: "同じ種類を使う" },
            { id: "seed-count", name: "種子の数", detail: "どちらも同じ数にする" }
          ],
          success: "温度だけがちがう実験です。冷ぞう庫では水がこおらない場所に置き、同じ日数で比べます。"
        },
        {
          id: "growth-light",
          question: "植物の成長に日光が関係するか調べたい",
          change: ["light"],
          controls: ["water", "fertilizer", "plant-kind", "start-size", "days"],
          conditions: [
            { id: "light", name: "日光", detail: "日光に当てる・当てない" },
            { id: "water", name: "水の量", detail: "同じ量を同じ時刻に" },
            { id: "fertilizer", name: "肥料", detail: "どちらも同じにする" },
            { id: "plant-kind", name: "植物の種類", detail: "同じ種類を使う" },
            { id: "start-size", name: "初めの大きさ", detail: "同じくらいの苗を使う" },
            { id: "days", name: "育てる日数", detail: "同じ日数で比べる" }
          ],
          success: "日光だけを変えました。成長を比べるには、初めの大きさや育てる日数もそろえる必要があります。"
        },
        {
          id: "pollination",
          question: "実ができるために受粉が必要か調べたい",
          change: ["pollen"],
          controls: ["plant-kind", "flower-stage", "bag", "days"],
          conditions: [
            { id: "pollen", name: "花粉をつけるか", detail: "一方だけめしべに花粉をつける" },
            { id: "plant-kind", name: "植物の種類", detail: "同じ種類の花を使う" },
            { id: "flower-stage", name: "花の育ち方", detail: "まだ開いていない同じ頃のつぼみ" },
            { id: "bag", name: "袋のかけ方", detail: "両方とも同じ袋でおおう" },
            { id: "days", name: "観察する日数", detail: "同じ日数後に比べる" }
          ],
          success: "花粉をつけるかどうかだけを変えました。虫などが花粉を運ばないよう、つぼみのうちに袋をかけます。"
        }
      ]
    },
    consideration: {
      title: "結果から考える",
      lead: "データを根拠に、言えることを選ぼう。実験していないことまで言い切らないのが、よい考察です。",
      questions: [
        {
          id: "result-water",
          prompt: "同じ室温で、種子10個ずつを調べた結果です。この結果から言えることは？",
          visual: { type: "table", headers: ["条件", "発芽した数"], rows: [["水あり・空気あり", "9個"], ["水なし・空気あり", "0個"]] },
          choices: ["発芽には水が関係している", "発芽には日光が必要である", "どんな種子も必ず9個発芽する", "水があると1日で発芽する"],
          answer: 0,
          feedback: "水以外の条件をそろえて比べているので、水が発芽に関係すると考えられます。日光や日数については、この結果だけでは言えません。"
        },
        {
          id: "say-cannot-say",
          prompt: "水ありの種子は発芽し、水なしは発芽しませんでした。「水が多いほど速く発芽する」と言える？",
          label: "言えること／言えないこと",
          choices: ["言える", "言えない"],
          answer: 1,
          feedback: "この実験は水の「あり・なし」を比べただけです。水の量と発芽の速さの関係は調べていないので、言い切れません。"
        },
        {
          id: "starch",
          prompt: "発芽前と発芽後の子葉にヨウ素液をつけた結果です。どの考察が最もよい？",
          visual: { type: "table", headers: ["子葉", "ヨウ素液の反応"], rows: [["発芽前", "青むらさき色になった"], ["発芽後", "色の変化が弱かった"]] },
          choices: ["種子のでんぷんは発芽や成長に使われた", "発芽するとでんぷんが新しく増える", "ヨウ素液が種子を発芽させた", "発芽には必ず日光が必要だ"],
          answer: 0,
          feedback: "発芽後にでんぷんの反応が弱くなったことから、種子にたくわえられていた養分が成長に使われたと考えます。"
        },
        {
          id: "growth-graph",
          prompt: "同じ大きさの苗を10日間育てました。グラフから言えることは？",
          visual: { type: "bars", max: 16, unit: "cm", bars: [{ label: "日光あり", value: 15 }, { label: "日光なし", value: 7 }] },
          choices: ["この条件では、日光ありの方がよく成長した", "日光があれば水はいらない", "すべての植物は必ず15cmになる", "肥料が多いほどよく成長する"],
          answer: 0,
          feedback: "測った結果に合わせて「この条件では」と表すのが正確です。水や肥料については、この比較からは分かりません。"
        },
        {
          id: "pollination-result",
          prompt: "花粉をつけた花は8個中7個が実になり、花粉をつけない花は8個中0個でした。最もよい結論は？",
          visual: { type: "table", headers: ["花", "実になった数"], rows: [["花粉をつけた", "7 / 8個"], ["花粉をつけない", "0 / 8個"]] },
          choices: ["実ができることには受粉が関係している", "受粉すれば必ず100%実になる", "花粉はめしべのもとでできる", "袋をかけると実が大きくなる"],
          answer: 0,
          feedback: "受粉の有無だけを変えた結果から、実ができることに受粉が関係すると考えられます。7個なので「必ず」とは言えません。"
        }
      ]
    }
  },
  completion: "条件を1つだけ変えて比べると、結果のちがいが何によるものか考えられます。考察では、データから分かる範囲をこえないことも大切です。"
};
