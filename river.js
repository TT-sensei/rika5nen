window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.river = {
  id: "river", number: "04", area: "EARTH", title: "流れる水のはたらき", subtitle: "水量と土地の様子を比べ、川が土地を変える仕組みを解き明かそう",
  phases: {
    knowledge: {
      title: "3つのはたらきを整理", lead: "けずる・運ぶ・積もらせる働きと、川の場所による違いを対にして整理します。",
      pairs: [
        { left: { title: "侵食・運搬", items: ["侵食：流れる水が土地をけずる", "運搬：土や石を下流へ運ぶ"] }, right: { title: "堆積", items: ["流れがゆるやかになると土や石が積もる", "運ばれた物がたまる"] }, caution: "『運搬』はけずることではなく、けずられた土や石を運ぶはたらきです。", check: { question: "流れがゆるやかになった所で土や石が積もるはたらきは？", choices: ["堆積", "侵食", "運搬", "蒸発"], answer: 0, feedback: "流れが弱まると、運びきれなくなった土や石が堆積します。" } },
        { left: { title: "山地・上流", items: ["傾きが急で流れが速い", "川幅がせまく、角ばった大きな石も多い", "谷が深い"] }, right: { title: "平地・下流", items: ["傾きがゆるやか", "川幅が広い", "小さく丸い石や砂が多い"] }, caution: "下流ほど石が大きくなるのではありません。運ばれる間にぶつかり、割れたりけずれたりします。", check: { question: "川の下流で多く見られる石の特徴は？", choices: ["小さく丸みがある", "大きく角ばっている", "全部同じ大きさ", "石は一つもない"], answer: 0, feedback: "石は運ばれる途中で小さく丸くなり、細かい物ほど下流まで運ばれます。" } },
        { left: { title: "ふだんの水量", items: ["流れの速さや働きは比較的小さい", "川の内側に土砂が積もることがある"] }, right: { title: "大雨で水量が増えたとき", items: ["流れが速く強くなる", "侵食・運搬の働きが大きくなる", "土地や川岸を大きく変えることがある"] }, caution: "水量が増えると水面が高くなるだけでなく、流れる水の働きそのものが大きくなります。", check: { question: "大雨で川の水量が増えると、流れる水の働きは？", choices: ["大きくなる", "必ずなくなる", "堆積だけになる", "変わらない"], answer: 0, feedback: "水量が増えると、侵食や運搬の働きが大きくなります。" } }
      ]
    },
    preparation: {
      title: "モデル実験を組み立てる", lead: "土で作った川に水を流し、調べたい条件だけを変えて比べます。",
      scenarios: [
        { id: "river-water", question: "水の量で、土地のけずられ方が変わるか調べたい", change: ["water"], controls: ["slope", "soil", "course", "time"], conditions: [
          { id: "water", name: "流す水の量", detail: "少ない・多いを比べる" }, { id: "slope", name: "土地の傾き", detail: "同じ傾きにする" }, { id: "soil", name: "土の種類と量", detail: "同じ土を同じ量使う" }, { id: "course", name: "流路の形", detail: "同じ形の川を作る" }, { id: "time", name: "水を流す時間", detail: "同じ時間で比べる" }
        ], success: "水量だけを変えれば、侵食や運搬の違いを水量と結び付けられます。" },
        { id: "river-slope", question: "土地の傾きで、流れの速さが変わるか調べたい", change: ["slope"], controls: ["water", "soil", "course", "distance"], conditions: [
          { id: "slope", name: "土地の傾き", detail: "ゆるい・急を比べる" }, { id: "water", name: "水の量", detail: "同じ量を流す" }, { id: "soil", name: "土の種類", detail: "同じ土を使う" }, { id: "course", name: "流路の幅と形", detail: "同じ形にする" }, { id: "distance", name: "測る距離", detail: "同じ距離を流れる時間で比べる" }
        ], success: "傾きだけを変え、同じ距離を進む時間を測ると、流れの速さを公平に比べられます。" },
        { id: "river-curve", question: "川のカーブの内側と外側で、けずられ方が違うか調べたい", change: ["position"], controls: ["water", "slope", "soil", "time"], conditions: [
          { id: "position", name: "観察する場所", detail: "カーブの内側・外側を比べる" }, { id: "water", name: "水の量", detail: "同じ流れの中で観察" }, { id: "slope", name: "土地の傾き", detail: "途中で変えない" }, { id: "soil", name: "土の種類", detail: "内外で同じ土" }, { id: "time", name: "観察する時点", detail: "同じ時間後に比べる" }
        ], success: "同じ流れのカーブ内外を比べると、外側の侵食と内側の堆積を捉えられます。" }
      ]
    },
    consideration: {
      title: "土地の変化を読み解く", lead: "モデル実験と実際の川の資料から、侵食・運搬・堆積を判断します。",
      questions: [
        { id: "curve", prompt: "川がカーブしている場所です。最もけずられやすいのは？", visual: { type: "river", outer: "A：外側", inner: "B：内側" }, choices: ["A：カーブの外側", "B：カーブの内側", "必ず中央だけ", "どこも同じ"], answer: 0, feedback: "カーブの外側は流れが速くなりやすく、侵食されます。内側は流れがゆるやかで堆積しやすい場所です。" },
        { id: "amount-table", prompt: "同じ土地に5分間水を流した結果です。水量と運ばれた土の関係は？", visual: { type: "table", headers: ["1分間の水量", "運ばれた土"], rows: [["200mL", "12g"], ["600mL", "41g"]] }, choices: ["この実験では水量が多い方が多く運んだ", "水量が多いと運搬はなくなる", "水量と運搬は絶対に無関係", "どの川でも必ず41g運ぶ"], answer: 0, feedback: "条件をそろえたこの実験では、水量が多い方が運搬の働きが大きいと考えられます。" },
        { id: "stones", prompt: "上流から下流へ進むにつれて、川原の石はどうなることが多い？", choices: ["小さく丸くなる", "大きく角ばる", "全部消える", "同じ形のまま"], answer: 0, feedback: "石どうしがぶつかって割れたりけずれたりしながら運ばれます。" },
        { id: "disaster", prompt: "大雨の後、川岸が大きくけずられ、下流に土砂がたまりました。説明として適切なのは？", choices: ["水量が増えて侵食・運搬が強まり、下流で堆積した", "川の水が働かなくなった", "堆積だけが上流で起きた", "石が自分で上流へ動いた"], answer: 0, feedback: "水量の増加で働きが大きくなり、場所によって侵食・運搬・堆積が起こります。" },
        { id: "overclaim", label: "言えること／言えないこと", prompt: "一つの模型実験だけで『日本中のすべての川は同じ形になる』と言える？", choices: ["言える", "言えない"], answer: 1, feedback: "模型から働きの規則性は考えられますが、実際の川は地形・岩石・水量などが違うため、すべて同じとは言えません。" }
      ]
    }
  },
  completion: "流れる水には侵食・運搬・堆積の働きがあります。水量や傾きと関係付け、模型の結果を実際の川へ広げるときは条件の違いにも注意します。"
};
