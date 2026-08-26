(() => {
  const unit = id => (window.SCIENCE_UNITS || []).find(item => item.id === id) || { id, title: id, color: "#2a8068" };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const fmt = value => Number.isInteger(value) ? value : Number(value).toFixed(1);

  function range(key, label, min, max, step, value, unitText = "") {
    return `<label class="sim-range"><span><b>${label}</b><strong><output>${fmt(value)}</output>${unitText}</strong></span><input type="range" data-sim-range data-key="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }

  function choices(key, label, options, current) {
    return `<div class="sim-choice"><span>${label}</span><div>${options.map(([value, text]) => `<button type="button" data-sim-set data-key="${key}" data-value="${esc(value)}" class="${String(value) === String(current) ? "active" : ""}">${text}</button>`).join("")}</div></div>`;
  }

  function metric(label, value) {
    return `<span class="sim-metric"><small>${label}</small><b>${value}</b></span>`;
  }

  function result(title, text, metrics = []) {
    return `<div class="sim-result-card"><span class="sim-result-label">RESULT</span><h3>${title}</h3><p>${text}</p>${metrics.length ? `<div class="sim-metrics">${metrics.join("")}</div>` : ""}</div>`;
  }

  function panel(title, body) {
    return `<section class="sim-control-section"><h3>${title}</h3>${body}</section>`;
  }

  function seedVisual(state) {
    const ready = state.water && state.air && state.temperature === "適温";
    const progress = ready ? Math.min(1, state.days / 4) : Math.min(.25, state.days / 16);
    const stem = Math.round(20 + progress * 115);
    return `<svg viewBox="0 0 620 330" role="img" aria-label="種子と植物の変化"><rect class="sim-ground" x="40" y="270" width="540" height="28" rx="14"/><path class="sim-root" d="M310 270q-4 20 5 35m-5-20q-25 10-27 28m29-16q23 8 30 25"/><path class="sim-stem" d="M310 270V${270 - stem}"/><path class="sim-leaf" d="M310 ${245 - stem / 2}q-55-36-105 4 55 18 105-4Z"/><path class="sim-leaf sim-leaf-alt" d="M310 ${225 - stem / 2}q52-40 103 0-55 24-103 0Z"/><ellipse class="sim-seed" cx="310" cy="278" rx="${Math.max(18, 34 - progress * 16)}" ry="${Math.max(10, 20 - progress * 8)}"/><text class="sim-svg-label" x="310" y="55" text-anchor="middle">${ready ? (state.days >= 4 ? "発芽して成長中" : "発芽の準備中") : "条件を変えてみよう"}</text></svg>`;
  }

  function plantVisual(state) {
    if (state.mode === "germination") return seedVisual(state);
    if (state.mode === "pollination") {
      const fruit = state.pollen && state.days >= 5;
      return `<svg viewBox="0 0 620 330" role="img" aria-label="花から実への変化"><path class="sim-stem" d="M310 285V120"/><path class="sim-leaf" d="M310 230q-70-35-115 20 65 15 115-20Z"/><path class="sim-leaf sim-leaf-alt" d="M310 205q66-45 120-3-60 28-120 3Z"/><circle class="sim-flower" cx="310" cy="105" r="35"/><circle class="sim-flower-petal" cx="275" cy="105" r="22"/><circle class="sim-flower-petal" cx="345" cy="105" r="22"/><circle class="sim-flower-petal" cx="310" cy="70" r="22"/><circle class="sim-flower-petal" cx="310" cy="140" r="22"/><circle class="sim-center" cx="310" cy="105" r="12"/><ellipse class="sim-fruit" cx="310" cy="180" rx="${fruit ? 36 : 8}" ry="${fruit ? 28 : 8}"/><text class="sim-svg-label" x="310" y="38" text-anchor="middle">${fruit ? "受粉して実ができた" : "受粉の結果を見てみよう"}</text></svg>`;
    }
    const rate = (state.light ? .65 : .28) + (state.water ? .35 : 0) + (state.fertilizer ? .15 : 0);
    const height = Math.min(190, 35 + state.days * 9 * rate);
    return `<svg viewBox="0 0 620 330" role="img" aria-label="植物の成長"><rect class="sim-ground" x="40" y="275" width="540" height="23" rx="12"/><path class="sim-root" d="M310 275q-8 18 0 34m0-20q-35 8-39 25m39-15q30 6 40 23"/><path class="sim-stem" d="M310 275V${275 - height}"/><path class="sim-leaf" d="M310 ${240 - height / 2}q-70-45-120 10 66 18 120-10Z"/><path class="sim-leaf sim-leaf-alt" d="M310 ${220 - height / 2}q72-45 125 1-65 27-125-1Z"/><text class="sim-svg-label" x="310" y="38" text-anchor="middle">${state.light ? "日光を受けて成長" : "日光なしの成長"}</text></svg>`;
  }

  const definitions = {
    plants: {
      timeKey: "days", timeMax: 14,
      initial: { mode: "germination", water: true, air: true, temperature: "適温", light: true, fertilizer: false, pollen: true, days: 4 },
      controls(state) {
        let body = choices("mode", "調べる内容", [["germination", "発芽"], ["growth", "成長"], ["pollination", "受粉と実"]], state.mode);
        if (state.mode === "germination") body += panel("発芽の条件", choices("water", "水", [[true, "あり"], [false, "なし"]], state.water) + choices("air", "空気", [[true, "あり"], [false, "なし"]], state.air) + choices("temperature", "温度", [["低温", "低い"], ["適温", "適温"], ["高温", "高い"]], state.temperature) + range("days", "経過日数", 0, 8, 1, state.days, "日"));
        if (state.mode === "growth") body += panel("成長の条件", choices("light", "日光", [[true, "あり"], [false, "なし"]], state.light) + choices("water", "水", [[true, "あり"], [false, "なし"]], state.water) + choices("fertilizer", "肥料", [[true, "あり"], [false, "なし"]], state.fertilizer) + range("days", "経過日数", 0, 14, 1, state.days, "日"));
        if (state.mode === "pollination") body += panel("花粉の条件", choices("pollen", "花粉", [[true, "つける"], [false, "つけない"]], state.pollen) + range("days", "経過日数", 0, 8, 1, state.days, "日"));
        return body;
      },
      visual: plantVisual,
      result(state) {
        if (state.mode === "germination") {
          const ready = state.water && state.air && state.temperature === "適温";
          return result(ready && state.days >= 4 ? "発芽した" : ready ? "発芽の準備中" : "発芽条件が足りない", ready ? "水・空気・適した温度がそろうと、時間とともに発芽します。" : "発芽には水・空気・発芽に適した温度が必要です。", [metric("水", state.water ? "あり" : "なし"), metric("空気", state.air ? "あり" : "なし"), metric("日数", `${state.days}日`)]);
        }
        if (state.mode === "pollination") return result(state.pollen && state.days >= 5 ? "実ができた" : "花の変化を観察中", state.pollen ? "花粉がめしべの先につく受粉が起こると、めしべのもとが実になります。" : "花粉をつけない条件と比べると、受粉のはたらきが分かります。", [metric("花粉", state.pollen ? "あり" : "なし"), metric("日数", `${state.days}日`)]);
        const rate = state.water ? (state.light ? "よく" : "ゆっくり") : "成長しにくく";
        return result(`${rate}成長するモデル`, "発芽の条件と、その後の成長に関係する条件を分けて考えましょう。", [metric("日光", state.light ? "あり" : "なし"), metric("水", state.water ? "あり" : "なし"), metric("日数", `${state.days}日`)]);
      },
      presets: [["基本の発芽", { mode: "germination", water: true, air: true, temperature: "適温", days: 4 }], ["水なしと比較", { mode: "germination", water: false, air: true, temperature: "適温", days: 6 }], ["受粉を試す", { mode: "pollination", pollen: true, days: 6 }]]
    },
    animals: {
      timeKey: "time", timeMax: 10,
      initial: { mode: "fish", time: 0, magnify: 2 },
      controls(state) { return choices("mode", "観察する生命", [["fish", "メダカ"], ["human", "人のたんじょう"]], state.mode) + panel("時間と観察", range("time", state.mode === "fish" ? "経過日数" : "経過月数", 0, 10, 1, state.time, state.mode === "fish" ? "日" : "か月") + choices("magnify", "観察倍率", [[1, "全体"], [2, "ふつう"], [3, "拡大"]], state.magnify)); },
      visual(state) {
        if (state.mode === "fish") {
          const progress = Math.min(1, state.time / 8);
          return `<svg viewBox="0 0 620 330" role="img" aria-label="メダカのたんじょう"><rect class="sim-water" x="35" y="55" width="550" height="220" rx="28"/><circle class="sim-egg" cx="310" cy="165" r="${30 + progress * 15}"/><path class="sim-fish" d="M${285 - progress * 20} 165q35-45 90 0-55 45-90 0Z"/><path class="sim-fish-tail" d="m${375 - progress * 20} 165 45-28v56Z"/><circle class="sim-eye" cx="${310 + progress * 22}" cy="158" r="4"/><text class="sim-svg-label" x="310" y="35" text-anchor="middle">${state.time < 3 ? "卵の中で変化" : state.time < 7 ? "体の形が見えてきた" : "ふ化して稚魚へ"}</text></svg>`;
        }
        const size = 30 + state.time * 10;
        return `<svg viewBox="0 0 620 330" role="img" aria-label="人のたんじょう"><ellipse class="sim-womb" cx="310" cy="175" rx="${75 + state.time * 3}" ry="${105 + state.time * 3}"/><circle class="sim-baby-head" cx="310" cy="${140 + state.time * 2}" r="${Math.max(13, size / 2)}"/><path class="sim-baby-body" d="M310 ${165 + state.time * 2}q-${size} 35-5 ${size * 2}q35 20 70 0-5-${size * 2}-${size - 5}"/><text class="sim-svg-label" x="310" y="35" text-anchor="middle">${state.time < 3 ? "受精卵から始まる" : state.time < 8 ? "体がつくられていく" : "生まれる準備"}</text></svg>`;
      },
      result(state) { const fish = state.mode === "fish"; return result(fish ? (state.time >= 7 ? "稚魚の姿へ" : "卵の中の変化") : (state.time >= 9 ? "生まれる準備" : "体がつくられていく"), fish ? "メダカは卵の中で体がつくられ、やがてふ化します。時間を進めて変化を観察しましょう。" : "人は母親の子宮の中で、受精卵から少しずつ体がつくられていきます。", [metric("観察", fish ? `${state.time}日目` : `${state.time}か月目`), metric("倍率", `×${state.magnify}`)]); },
      presets: [["観察はじめ", { mode: "fish", time: 0 }], ["ふ化のころ", { mode: "fish", time: 8 }], ["人の成長", { mode: "human", time: 7 }]]
    },
    weather: {
      timeKey: "hours", timeMax: 24,
      initial: { hours: 0, speed: "標準", point: "西" },
      controls(state) { return panel("雲の動き", range("hours", "経過時間", 0, 24, 1, state.hours, "時間") + choices("speed", "雲の速さ", [["ゆっくり", "ゆっくり"], ["標準", "標準"], ["速い", "速い"]], state.speed) + choices("point", "観察地点", [["西", "西"], ["中央", "中央"], ["東", "東"]], state.point)); },
      visual(state) { const speed = state.speed === "速い" ? 1.5 : state.speed === "ゆっくり" ? .65 : 1; const x = 85 + Math.min(450, state.hours * 18 * speed); return `<svg viewBox="0 0 620 330" role="img" aria-label="天気の変化"><rect class="sim-sky" x="28" y="32" width="564" height="245" rx="28"/><circle class="sim-sun" cx="500" cy="95" r="35"/><g class="sim-cloud" transform="translate(${Math.min(400, x)},120)"><circle cx="0" cy="25" r="28"/><circle cx="34" cy="5" r="38"/><circle cx="75" cy="25" r="28"/><rect x="0" y="25" width="75" height="30" rx="15"/></g><path class="sim-map-arrow" d="M95 300h420m-18-12 18 12-18 12"/><text class="sim-svg-label" x="310" y="62" text-anchor="middle">西から東へ雲が動く</text><text class="sim-svg-small" x="95" y="324">西</text><text class="sim-svg-small" x="310" y="324">中央</text><text class="sim-svg-small" x="515" y="324">東</text></svg>`; },
      result(state) { const local = state.point === "西" ? state.hours < 8 : state.point === "中央" ? state.hours < 16 : state.hours < 23; const weather = local ? "雲が多い" : "晴れに近い"; return result(`${state.point}の天気：${weather}`, "雲は西から東へ動くため、時間を進めると場所によって天気の変化する順番が見えてきます。", [metric("時刻", `${state.hours}時間後`), metric("雲の速さ", state.speed)]); },
      presets: [["観察開始", { hours: 0, point: "西" }], ["半日後", { hours: 12, point: "中央" }], ["1日後", { hours: 24, point: "東" }]]
    },
    river: {
      timeKey: "time", timeMax: 10,
      initial: { slope: 2, water: 2, grain: "砂", time: 0 },
      controls(state) { return panel("流れる水の条件", range("slope", "川の傾き", 1, 3, 1, state.slope, "段階") + range("water", "水の量", 1, 3, 1, state.water, "段階") + choices("grain", "運ばれる土砂", [["れき", "れき"], ["砂", "砂"], ["泥", "泥"]], state.grain) + range("time", "流した時間", 0, 10, 1, state.time, "分")); },
      visual(state) { const width = 42 + state.water * 12; const rough = state.slope * state.water + state.time; return `<svg viewBox="0 0 620 330" role="img" aria-label="流れる水のはたらき"><rect class="sim-land" x="30" y="30" width="560" height="260" rx="24"/><path class="sim-river-bed" d="M70 70q100 20 155 100t160 0q70-45 170-15"/><path class="sim-river-flow" style="stroke-width:${width}px" d="M70 70q100 20 155 100t160 0q70-45 170-15"/><g class="sim-particles">${Array.from({ length: Math.min(12, 3 + rough) }, (_, i) => `<circle cx="${100 + i * 34}" cy="${80 + (i % 4) * 38}" r="${state.grain === "れき" ? 6 : state.grain === "砂" ? 4 : 2}"/>`).join("")}</g><text class="sim-svg-label" x="310" y="52" text-anchor="middle">${rough >= 10 ? "けずる・運ぶ力が大きい" : "流れを変えて観察しよう"}</text></svg>`; },
      result(state) { const force = state.slope * state.water + state.time; const action = force >= 10 ? "けずる・運ぶ力が大きい" : force >= 6 ? "土砂を運んでいる" : "ゆるやかに流れている"; return result(action, force >= 10 ? "水の量や傾きが大きいほど、流れる水のはたらきが強くなるモデルです。" : "時間や水量を変えると、けずる・運ぶ・積もらせる働きの違いを比べられます。", [metric("水量", `${state.water}段階`), metric("傾き", `${state.slope}段階`), metric("時間", `${state.time}分`)]); },
      presets: [["ゆるやかな川", { slope: 1, water: 1, time: 4 }], ["大雨の川", { slope: 3, water: 3, time: 8 }], ["砂を運ぶ", { grain: "砂", slope: 2, water: 2, time: 6 }]]
    },
    solutions: {
      timeKey: "time", timeMax: 20,
      initial: { substance: "食塩", water: 100, temperature: 20, amount: 20, stir: true, time: 10 },
      controls(state) { return panel("とける条件", choices("substance", "物質", [["食塩", "食塩"], ["ミョウバン", "ミョウバン"]], state.substance) + range("water", "水の量", 50, 200, 50, state.water, "mL") + range("temperature", "水の温度", 20, 60, 10, state.temperature, "℃") + range("amount", "とかす量", 5, 50, 5, state.amount, "g") + choices("stir", "かき混ぜ", [[true, "する"], [false, "しない"]], state.stir) + range("time", "経過時間", 0, 20, 1, state.time, "秒")); },
      visual(state) { const capacity = dissolveCapacity(state); const dissolved = Math.min(state.amount, capacity, state.time * (state.stir ? 2 : 1)); const left = Math.max(0, state.amount - dissolved); return `<svg viewBox="0 0 620 330" role="img" aria-label="物のとけ方"><path class="sim-glass" d="M190 48h240l-22 224H212Z"/><path class="sim-liquid" d="M205 125h210l-13 140H218Z"/><g class="sim-particles">${Array.from({ length: Math.min(28, Math.round(dissolved / 2)) }, (_, i) => `<circle cx="${230 + (i * 41) % 150}" cy="${155 + (i * 23) % 100}" r="3"/>`).join("")}</g>${left ? `<path class="sim-sediment" d="M225 250q85-15 170 0v18H225Z"/>` : ""}<text class="sim-svg-label" x="310" y="32" text-anchor="middle">${left ? `${fmt(left)}g とけ残り` : "すべてとけた"}</text></svg>`; },
      result(state) { const capacity = dissolveCapacity(state); const dissolved = Math.min(state.amount, capacity, state.time * (state.stir ? 2 : 1)); const left = Math.max(0, state.amount - dissolved); return result(left ? `${fmt(left)}g とけ残り` : "すべてとけた", state.stir ? "かき混ぜると、とける速さが速くなります。最終的にとける量は、水の量・温度・物質の種類で決まります。" : "かき混ぜると、とける速さが変わります。水の量や温度も変えて比べてみましょう。", [metric("とけた量", `${fmt(dissolved)}g`), metric("限界の目安", `${fmt(capacity)}g`), metric("水", `${state.water}mL`)]); },
      presets: [["食塩をとかす", { substance: "食塩", water: 100, temperature: 20, amount: 20, stir: true, time: 10 }], ["ミョウバンを温める", { substance: "ミョウバン", water: 100, temperature: 60, amount: 20, stir: true, time: 15 }], ["水を増やす", { substance: "食塩", water: 200, temperature: 20, amount: 40, stir: true, time: 20 }]]
    },
    electromagnet: {
      initial: { turns: 100, current: .5, core: true, direction: "正" },
      controls(state) { return panel("電磁石の条件", range("turns", "コイルの巻き数", 50, 200, 50, state.turns, "回") + range("current", "電流の大きさ", .2, 1, .1, state.current, "A") + choices("core", "鉄心", [[true, "あり"], [false, "なし"]], state.core) + choices("direction", "電流の向き", [["正", "正方向"], ["反対", "反対方向"]], state.direction)); },
      visual(state) { const power = magnetPower(state); const pole = state.direction === "正" ? "N" : "S"; return `<svg viewBox="0 0 620 330" role="img" aria-label="電磁石の強さ"><rect class="sim-core" x="270" y="82" width="80" height="160" rx="12"/><g class="sim-coil">${Array.from({ length: 6 }, (_, i) => `<path d="M${245 - i * 4} ${82 + i * 20}q-34 20 0 40t0 40"/>`).join("")}</g><path class="sim-pole" d="M310 48v34m0 160v34"/><text class="sim-pole-label" x="310" y="42" text-anchor="middle">${pole}極</text><g class="sim-clips">${Array.from({ length: Math.min(10, Math.max(1, Math.round(power / 10))) }, (_, i) => `<circle cx="${410 + (i % 5) * 27}" cy="${120 + Math.floor(i / 5) * 55}" r="9"/>`).join("")}</g><text class="sim-svg-label" x="310" y="315" text-anchor="middle">${state.core ? "鉄心あり" : "鉄心なし"}・強さ ${fmt(power)}</text></svg>`; },
      result(state) { const power = magnetPower(state); return result(`電磁石の強さ：${fmt(power)}`, "電流を大きくしたり、コイルの巻き数を増やしたり、鉄心を入れたりすると、磁力が強くなるモデルです。", [metric("巻き数", `${state.turns}回`), metric("電流", `${fmt(state.current)}A`), metric("極", state.direction === "正" ? "N極" : "S極")]); },
      presets: [["基本", { turns: 100, current: .5, core: true, direction: "正" }], ["強い電磁石", { turns: 200, current: 1, core: true }], ["極を反対に", { turns: 100, current: .5, core: true, direction: "反対" }]]
    },
    pendulum: {
      initial: { length: 40, weight: 100, angle: 20, measured: false },
      controls(state) { return panel("ふりこの条件", range("length", "ふりこの長さ", 20, 80, 10, state.length, "cm") + range("weight", "おもりの重さ", 50, 150, 25, state.weight, "g") + range("angle", "振れ幅", 10, 30, 5, state.angle, "°") + `<button type="button" class="sim-wide-button" data-sim-action="measure">10往復を測る</button>`); },
      visual(state) { const angle = state.angle * Math.PI / 180; const x = 310 + Math.sin(angle) * 145; const y = 70 + Math.cos(angle) * 145; return `<svg viewBox="0 0 620 330" role="img" aria-label="ふりこの運動"><path class="sim-ceiling" d="M120 55h380"/><circle class="sim-pivot" cx="310" cy="55" r="9"/><path class="sim-string" d="M310 55L${x} ${y}"/><circle class="sim-bob" cx="${x}" cy="${y}" r="${15 + state.weight / 15}"/><path class="sim-arc" d="M195 200q115 100 230 0"/><text class="sim-svg-label" x="310" y="310" text-anchor="middle">長さ ${state.length}cm・1往復 ${fmt(period(state))}秒</text></svg>`; },
      result(state) { const p = period(state); return result(`${state.length}cmの1往復：約${fmt(p)}秒`, state.length > 50 ? "ふりこの長さが長いほど、1往復する時間は長くなります。おもりの重さを変えても、時間はほぼ変わりません。" : "長さを変えると1往復する時間が変わります。重さだけを変えたときの違いも比べてみましょう。", [metric("10往復", state.measured ? `${fmt(p * 10)}秒` : "測ってみよう"), metric("長さ", `${state.length}cm`), metric("重さ", `${state.weight}g`)]); },
      presets: [["短いふりこ", { length: 20, weight: 100, angle: 20, measured: false }], ["長いふりこ", { length: 80, weight: 100, angle: 20, measured: false }], ["重さだけ変更", { length: 40, weight: 150, angle: 20, measured: false }]]
    }
  };

  function dissolveCapacity(state) {
    const salt = state.substance === "食塩";
    const base = salt ? 36 + (state.temperature - 20) * .08 : 6 + (state.temperature - 20) * .35;
    return Math.max(1, base * state.water / 100);
  }

  function magnetPower(state) { return state.turns / 100 * state.current * (state.core ? 18 : 5); }
  function period(state) { return 2 * Math.PI * Math.sqrt((state.length / 100) / 9.8) * (1 + Math.max(0, state.angle - 15) / 1000); }

  function render(id) {
    const def = definitions[id];
    if (!def) return "";
    const info = unit(id);
    return `<div class="simulator-page" data-sim-unit="${id}" style="--sim-accent:${info.color}">
      <div class="simulator-head"><button type="button" class="sim-back" data-sim-home>← 単元一覧へ</button><span class="sim-kicker">SCIENCE SIMULATOR / ${info.number || ""}</span><h1>${info.title}</h1><p>条件を動かして、現象の変化を見つけよう。</p></div>
      <div class="sim-workspace">
        <section class="sim-stage-card"><div class="sim-stage-head"><div><span class="sim-kicker">LIVE MODEL</span><h2>いま、どうなっている？</h2></div><span class="sim-live">● すぐ変化</span></div><div class="sim-visual" data-sim-visual></div><div data-sim-result></div><div class="sim-stage-actions"><button type="button" class="sim-secondary" data-sim-action="reset">最初にもどす</button>${def.timeKey ? "<button type=\"button\" class=\"sim-primary\" data-sim-action=\"time\">時間を進める</button>" : ""}</div></section>
        <aside class="sim-controls"><div class="sim-controls-head"><span class="sim-kicker">CHANGE CONDITIONS</span><h2>条件を変える</h2><p>ボタンやスライダーを動かすと、図と結果がすぐ変わります。</p></div><div data-sim-controls></div><div class="sim-presets"><span>すぐ試す</span><div>${def.presets.map((preset, index) => `<button type="button" data-sim-preset="${index}">${preset[0]}</button>`).join("")}</div></div></aside>
      </div>
    </div>`;
  }

  function bind(root) {
    const id = root.dataset.simUnit;
    const def = definitions[id];
    if (!def) return;
    let state = clone(def.initial);
    const update = () => {
      root.querySelector("[data-sim-controls]").innerHTML = def.controls(state);
      root.querySelector("[data-sim-visual]").innerHTML = def.visual(state);
      root.querySelector("[data-sim-result]").innerHTML = def.result(state);
    };
    root.addEventListener("input", event => {
      const input = event.target.closest("[data-sim-range]");
      if (!input) return;
      state[input.dataset.key] = Number(input.value);
      update();
    });
    root.addEventListener("click", event => {
      const set = event.target.closest("[data-sim-set]");
      if (set) { state[set.dataset.key] = set.dataset.value === "true" ? true : set.dataset.value === "false" ? false : /^-?\d+(\.\d+)?$/.test(set.dataset.value) ? Number(set.dataset.value) : set.dataset.value; update(); return; }
      const preset = event.target.closest("[data-sim-preset]");
      if (preset) { Object.assign(state, clone(def.presets[Number(preset.dataset.simPreset)]?.[1] || {})); update(); return; }
      const action = event.target.closest("[data-sim-action]");
      if (!action) return;
      if (action.dataset.simAction === "reset") state = clone(def.initial);
      if (action.dataset.simAction === "time" && def.timeKey) state[def.timeKey] = Math.min(def.timeMax, state[def.timeKey] + (def.timeKey === "hours" ? 4 : 2));
      if (action.dataset.simAction === "measure") state.measured = true;
      update();
    });
    root.querySelector("[data-sim-preset]")?.parentElement?.querySelectorAll("[data-sim-preset]").forEach(button => {
      button.dataset.simPreset = button.dataset.simPreset || button.getAttribute("data-sim-preset");
    });
    update();
  }

  window.ScienceSim = { render, bind, definitions };
})();
