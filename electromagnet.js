window.SCIENCE_UNIT_DATA = window.SCIENCE_UNIT_DATA || {};

window.SCIENCE_UNIT_DATA.electromagnet = {
  id: "electromagnet", number: "06", area: "ENERGY", title: "電流がつくる磁力", subtitle: "電流の向き・大きさ・コイルの巻き数を制御して、電磁石の秘密を探ろう",
  phases: {
    knowledge: {
      title: "磁石との違いを整理", lead: "永久磁石と電磁石、極の向きと強さに関わる条件を対にして整理します。",
      pairs: [
        { left: { title: "永久磁石", items: ["電流がなくても磁力がある", "N極とS極が決まっている"] }, right: { title: "電磁石", items: ["コイルに電流が流れると磁力が生まれる", "電流を止めると磁力がほぼなくなる", "鉄心を入れると強くなる"] }, caution: "導線を巻いただけでは電磁石として働きません。コイルに電流を流す必要があります。", check: { question: "電磁石が磁力をもつのはいつ？", choices: ["コイルに電流が流れているとき", "電池を外した後いつまでも", "導線を置いただけ", "木の棒を入れたとき"], answer: 0, feedback: "コイルに電流が流れると、鉄心が磁石のように働きます。" } },
        { left: { title: "電流を一方向に流す", items: ["一方がN極、反対がS極になる"] }, right: { title: "電流を反対向きに流す", items: ["N極とS極が入れ替わる", "乾電池の向きを変えて確かめられる"] }, caution: "電流の向きを反対にしても磁力がなくなるのではなく、極が反対になります。", check: { question: "電流の向きを反対にすると、電磁石の極は？", choices: ["N極とS極が入れ替わる", "両方N極になる", "必ず磁力がなくなる", "変わらない"], answer: 0, feedback: "電流の向きと電磁石の極の向きには関係があります。" } },
        { left: { title: "電磁石を強くする方法", items: ["流す電流を大きくする", "コイルの巻き数を増やす"] }, right: { title: "公平に比べるために", items: ["調べる条件以外を同じにする", "同じ鉄心・同じクリップで測る", "電池の消耗にも注意する"] }, caution: "電流と巻き数を同時に変えると、どちらが強さの原因か分からなくなります。", check: { question: "巻き数の影響を調べるとき、同じにする条件は？", choices: ["電流の大きさや鉄心", "巻き数", "巻き数と電流の両方を変える", "クリップの種類も毎回変える"], answer: 0, feedback: "巻き数だけを変え、電流や鉄心などをそろえます。" } }
      ]
    },
    preparation: {
      title: "電磁石の実験を組み立てる", lead: "回路では条件が同時に変わりやすいため、電流・巻き数・向きを一つずつ調べます。",
      scenarios: [
        { id: "magnet-current", question: "電流の大きさで、電磁石の強さが変わるか調べたい", change: ["current"], controls: ["turns", "core", "clips", "time"], conditions: [
          { id: "current", name: "電流の大きさ", detail: "電池1個・2個などで比べる" }, { id: "turns", name: "コイルの巻き数", detail: "同じ巻き数" }, { id: "core", name: "鉄心", detail: "同じ太さ・長さ" }, { id: "clips", name: "持ち上げる物", detail: "同じ種類のクリップ" }, { id: "time", name: "電流を流す時間", detail: "同じ時間で測る" }
        ], success: "電流だけを変え、持ち上げた同じクリップの数で磁力を比べられます。長時間流し続けないようにします。" },
        { id: "magnet-turns", question: "コイルの巻き数で、電磁石の強さが変わるか調べたい", change: ["turns"], controls: ["current", "core", "clips", "time"], conditions: [
          { id: "turns", name: "コイルの巻き数", detail: "100回・200回などで比べる" }, { id: "current", name: "電流の大きさ", detail: "電流計で同じにする" }, { id: "core", name: "鉄心", detail: "同じ鉄くぎ" }, { id: "clips", name: "持ち上げる物", detail: "同じ種類のクリップ" }, { id: "time", name: "電流を流す時間", detail: "同じ時間で測る" }
        ], success: "巻き数だけを変えます。電池の個数だけでなく、電流計で電流が同じか確かめると確実です。" },
        { id: "magnet-poles", question: "電流の向きで、電磁石の極が変わるか調べたい", change: ["direction"], controls: ["turns", "core", "current", "compass"], conditions: [
          { id: "direction", name: "電流の向き", detail: "乾電池の向きを反対にする" }, { id: "turns", name: "コイルの巻き方と巻き数", detail: "同じコイルを使う" }, { id: "core", name: "鉄心", detail: "同じ鉄心" }, { id: "current", name: "電流の大きさ", detail: "同じ大きさ" }, { id: "compass", name: "方位磁針の位置", detail: "同じ端・同じ距離で調べる" }
        ], success: "電流の向きだけを反対にし、同じ端で極を調べると、N極とS極の入れ替わりを確かめられます。" }
      ]
    },
    consideration: {
      title: "結果から規則を見つける", lead: "クリップの数や電流の値から、電磁石の強さと条件の関係を考えます。",
      questions: [
        { id: "current-data", prompt: "同じ100回巻きコイルで調べた結果です。電流と磁力の関係は？", visual: { type: "table", headers: ["電流", "持ち上げたクリップ"], rows: [["0.3A", "4個"], ["0.6A", "9個"]] }, choices: ["この範囲では電流が大きい方が磁力が強い", "電流が大きいと磁力がなくなる", "巻き数が増えた", "必ず9個だけ持ち上がる"], answer: 0, feedback: "巻き数などをそろえた結果から、電流の大きさと磁力の関係を考えられます。" },
        { id: "turns-data", prompt: "同じ0.5Aで、100回巻きは5個、200回巻きは11個のクリップを持ち上げました。言えることは？", choices: ["この条件では巻き数が多い方が磁力が強い", "巻き数が多いと電流は必ず0になる", "電流の向きが反対になった", "鉄心がなくなった"], answer: 0, feedback: "電流などをそろえているので、巻き数の違いと磁力を関係付けられます。" },
        { id: "pole-change", prompt: "乾電池の向きを反対にすると、同じ端で方位磁針の反対側が引かれました。何が変わった？", choices: ["電磁石のN極とS極が入れ替わった", "鉄心の長さ", "コイルの巻き数", "方位磁針が永久にこわれた"], answer: 0, feedback: "電流の向きを反対にすると、電磁石の極も反対になります。" },
        { id: "bad-test", prompt: "Aは100回巻き・電池1個、Bは200回巻き・電池2個でした。Bが強かったとき、原因を一つに決められる？", choices: ["決められない", "巻き数だけが原因", "電池だけが原因", "鉄心だけが原因"], answer: 0, feedback: "巻き数と電流の二つが同時に変わっているため、どちらの影響か区別できません。" },
        { id: "safety", prompt: "実験で大切な安全上の注意は？", choices: ["電流を長時間流し続けず、導線や電池の発熱に注意する", "導線が熱くても持ち続ける", "ショート回路にする", "ぬれた手で電池を触る"], answer: 0, feedback: "電磁石の回路は発熱することがあります。測るときだけ電流を流します。" }
      ]
    }
  },
  completion: "電磁石の極は電流の向きで変わり、強さは電流の大きさやコイルの巻き数で変わります。一つの条件だけを変えて確かめることが重要です。"
};
