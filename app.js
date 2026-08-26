/*
 * Runtime bundle for the fifth-grade LABs.
 * Source modules live in labs/ and are concatenated here so GitHub Pages can
 * load the simulator with one stable root-level script.
 */

/* --- labs/lab-core.js --- */
(() => {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>\"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[char]));

  function shell(root, manifest, { onHome } = {}) {
    root.innerHTML = `
      <section class="lab-screen instant-lab" style="--lab-accent:${esc(manifest.accent || "#2a8068")}">
        <nav class="breadcrumbs" aria-label="現在位置">
          <button class="text-button" type="button" data-lab-home>シミュレーション一覧</button>
          <span>›</span><span>${esc(manifest.title)}</span>
        </nav>
        <header class="lab-titlebar">
          <div><p class="eyebrow">SIMULATION LAB / ${esc(manifest.unit)}</p><h1>${esc(manifest.title)}</h1><p>${esc(manifest.summary)}</p></div>
          <button class="secondary-button lab-back" type="button" data-lab-home>一覧へ戻る</button>
        </header>
        <div class="lab-workspace">
          <section class="simulation-column" aria-label="シミュレーション">
            <div class="sim-stage" data-sim-stage></div>
            <div class="sim-readout" data-sim-readout aria-live="polite"></div>
            <div class="sim-actions" data-sim-actions></div>
          </section>
          <aside class="control-panel instant-panel" aria-label="条件操作">
            <div class="control-heading"><p class="eyebrow">TRY IT</p><h2>条件を変えてみよう</h2><p>動かすと、図と結果がすぐ変わります。</p></div>
            <div data-control-panel></div>
          </aside>
        </div>
        <p class="model-note" data-model-note></p>
      </section>`;

    const view = root.querySelector(".lab-screen");
    const cleanups = [];
    const on = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
      return handler;
    };
    view.querySelectorAll("[data-lab-home]").forEach(button => on(button, "click", () => onHome?.()));

    return {
      root: view,
      stage: view.querySelector("[data-sim-stage]"),
      readout: view.querySelector("[data-sim-readout]"),
      actions: view.querySelector("[data-sim-actions]"),
      panel: view.querySelector("[data-control-panel]"),
      note: view.querySelector("[data-model-note]"),
      on,
      destroy() {
        cleanups.splice(0).forEach(cleanup => cleanup());
        view.remove();
      }
    };
  }

  function section(parent, title, hint = "") {
    const element = document.createElement("section");
    element.className = "control-section";
    element.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p>${esc(hint)}</p>` : ""}`;
    parent.append(element);
    return element;
  }

  function range(parent, { label, min, max, step = 1, value, format = value => value, onInput }) {
    const id = `lab-range-${Math.random().toString(36).slice(2)}`;
    const row = document.createElement("label");
    row.className = "range-control";
    row.innerHTML = `<span>${esc(label)} <output for="${id}">${esc(format(value))}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
    const input = row.querySelector("input");
    const output = row.querySelector("output");
    const update = next => { input.value = next; output.textContent = format(Number(next)); };
    input.addEventListener("input", () => { output.textContent = format(Number(input.value)); onInput?.(Number(input.value)); });
    parent.append(row);
    return { input, output, set: update };
  }

  function options(parent, { label, values, value, format = item => item.label, onChange }) {
    const wrap = document.createElement("div");
    wrap.className = "segmented-control";
    wrap.innerHTML = `<span>${esc(label)}</span><div>${values.map(item => `<button type="button" data-option-value="${esc(item.id ?? item)}" aria-pressed="${String(item.id ?? item) === String(value)}">${esc(format(item))}</button>`).join("")}</div>`;
    const buttons = [...wrap.querySelectorAll("button")];
    const set = next => buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.optionValue) === String(next)));
    buttons.forEach(button => button.addEventListener("click", () => {
      set(button.dataset.optionValue);
      onChange?.(button.dataset.optionValue);
    }));
    parent.append(wrap);
    return { set };
  }

  function action(parent, label, onClick, className = "secondary-button") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    parent.append(button);
    return button;
  }

  function presets(parent, items, onSelect) {
    const wrap = section(parent, "プリセット", "まずはここから試してもOK");
    wrap.classList.add("preset-section");
    const row = document.createElement("div");
    row.className = "preset-buttons";
    items.forEach(item => action(row, item.label, () => onSelect(item.id), "preset-button"));
    wrap.append(row);
    return wrap;
  }

  function renderReadout(target, { metrics = [], message = "", note = "" } = {}) {
    target.innerHTML = `<div class="instant-readout-grid">${metrics.map(metric => `<div class="instant-metric"><span>${esc(metric.label)}</span><b>${esc(metric.value)}</b>${metric.detail ? `<small>${esc(metric.detail)}</small>` : ""}</div>`).join("")}</div><div class="instant-result"><strong>結果</strong><p>${esc(message)}</p></div>${note ? `<p class="instant-note">${esc(note)}</p>` : ""}`;
  }

  function renderError(root, message) {
    root.innerHTML = `<section class="empty-state lab-error"><h1>LABを読み込めませんでした</h1><p>${esc(message || "画面を更新して、もう一度試してください。")}</p><button class="primary-button" type="button" data-lab-home>シミュレーション一覧へ</button></section>`;
  }

  window.RikaFiveLabCore = { esc, shell, section, range, options, action, presets, renderReadout, renderError };
})();
/* --- labs/plants-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};

  const DEFAULT_GROWTH = { water: true, air: true, temperature: 24, light: true, days: 4 };
  const DEFAULT_FLOWER = { pollen: false, source: "なし", days: 0 };
  const boolOption = [{ id: "yes", label: "あり" }, { id: "no", label: "なし" }];

  function growthModel(state) {
    const temperatureOk = state.temperature >= 15 && state.temperature <= 35;
    const canGerminate = state.water && state.air && temperatureOk;
    const temperatureFactor = state.temperature >= 20 && state.temperature <= 30 ? 1 : .72;
    const germination = canGerminate ? Math.min(1, state.days / 3 * temperatureFactor) : 0;
    const growthDays = Math.max(0, state.days - 3);
    const growthFactor = state.water && temperatureOk ? (state.light ? 1 : .35) : 0;
    const height = Math.round(growthDays * 2.2 * growthFactor * 10) / 10;
    const leaves = Math.max(0, Math.min(5, Math.floor(growthDays * growthFactor / 2)));
    return { temperatureOk, canGerminate, germination, height, leaves };
  }

  function plantSvg(state, model) {
    const sprout = model.germination >= 1;
    const stemHeight = sprout ? Math.min(185, 35 + model.height * 18) : model.germination * 30;
    const baseY = 290;
    const topY = baseY - stemHeight;
    const leaves = Array.from({ length: model.leaves }, (_, index) => {
      const y = Math.max(125, topY + 34 + index * 28);
      const side = index % 2 ? 1 : -1;
      return `<ellipse class="plant-leaf" cx="${380 + side * 33}" cy="${y}" rx="35" ry="13" transform="rotate(${side * 26} ${380 + side * 33} ${y})"/>`;
    }).join("");
    const rootLength = sprout ? Math.min(95, 28 + model.height * 11) : model.germination * 36;
    return `<svg class="plant-sim-svg" viewBox="0 0 760 360" role="img" aria-label="種子から植物へ変化するシミュレーション">
      <defs><linearGradient id="plant-sky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#e9f6ee"/><stop offset="1" stop-color="#f8fbf4"/></linearGradient></defs>
      <rect width="760" height="360" fill="url(#plant-sky)"/>
      <circle class="plant-sun ${state.light ? "is-on" : "is-off"}" cx="650" cy="66" r="31"/>
      <path class="plant-ground" d="M80 290 Q230 275 380 290 T680 290 V360 H80Z"/>
      <path class="plant-root" d="M380 290 Q${370 - rootLength / 3} ${310 + rootLength / 3} 380 ${290 + rootLength}"/>
      <path class="plant-stem" d="M380 290 Q${374 + (state.light ? 10 : -8)} ${(290 + topY) / 2} 380 ${topY}"/>
      ${leaves}
      <ellipse class="plant-seed" cx="380" cy="${sprout ? 288 : 300}" rx="${sprout ? 12 : 27}" ry="${sprout ? 8 : 16}"/>
      <text class="plant-label" x="380" y="34" text-anchor="middle">${sprout ? "発芽して、根・茎・葉が成長" : state.days ? "種子がふくらみ、発芽の準備" : "種子"}</text>
      <text class="plant-caption" x="90" y="330">土の中：根</text><text class="plant-caption" x="540" y="330">日光：${state.light ? "あり" : "なし"}</text>
    </svg>`;
  }

  function flowerSvg(state) {
    const fruitReady = state.pollen && state.days >= 3;
    const seedsReady = state.pollen && state.days >= 5;
    const fruitGrowing = state.pollen && state.days >= 1;
    const flower = (x, label, pollinated) => `<g transform="translate(${x} 0)">
      <path class="flower-stem" d="M0 264 V160"/><ellipse class="flower-leaf" cx="-31" cy="225" rx="34" ry="13" transform="rotate(-22 -31 225)"/><ellipse class="flower-leaf" cx="31" cy="203" rx="34" ry="13" transform="rotate(22 31 203)"/>
      ${fruitReady && pollinated ? `<ellipse class="flower-fruit" cx="0" cy="198" rx="34" ry="40"/><path class="fruit-line" d="M0 160v-18"/>` : `<g class="flower-head"><circle cx="0" cy="137" r="24"/>${[0,60,120,180,240,300].map(angle => `<ellipse cx="0" cy="101" rx="16" ry="32" transform="rotate(${angle} 0 137)"/>`).join("")}</g><path class="flower-pistil" d="M0 160v-50"/>`}
      ${pollinated ? `<circle class="pollen-cloud" cx="0" cy="105" r="${fruitGrowing ? 5 : 9}"/>` : ""}
      <text class="flower-label" x="0" y="306" text-anchor="middle">${label}</text>
      <text class="flower-state" x="0" y="330" text-anchor="middle">${pollinated ? (seedsReady ? "実と種子ができた" : fruitReady ? "実ができた" : "受粉した") : "受粉していない"}</text>
    </g>`;
    return `<svg class="flower-sim-svg" viewBox="0 0 760 360" role="img" aria-label="受粉した花と受粉していない花の比較">
      <rect width="760" height="360" fill="#fff8ed"/><path class="flower-divider" d="M380 55v260"/><text class="flower-title" x="380" y="32" text-anchor="middle">花粉がめしべにつくと、時間とともに実になる</text>
      ${flower(190, "受粉あり", state.pollen)}${flower(570, "受粉なし", false)}
    </svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    let mode = "growth";
    const growth = { ...DEFAULT_GROWTH };
    const flower = { ...DEFAULT_FLOWER };

    function paintGrowth() {
      const model = growthModel(growth);
      ui.stage.innerHTML = plantSvg(growth, model);
      const status = model.germination >= 1 ? "発芽した" : model.germination > 0 ? "発芽の途中" : "まだ発芽していない";
      const message = !model.canGerminate
        ? "発芽には、水・空気・適した温度が必要です。"
        : !growth.light && growth.days > 3
          ? "発芽はしても、日光がないと成長は小さくなります。発芽と成長を分けて見ましょう。"
          : "発芽に必要な条件と、その後の成長に関係する条件を分けて確認できます。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "発芽", value: status },
        { label: "根", value: `${Math.round(model.germination * 100)}%` },
        { label: "茎の高さ", value: `${model.height} cm`, detail: `葉 ${model.leaves}枚` }
      ], message, note: `経過：${growth.days}日　／　温度：${growth.temperature}℃` });
    }

    function paintFlower() {
      ui.stage.innerHTML = flowerSvg(flower);
      const result = flower.pollen ? (flower.days >= 5 ? "実と種子ができた" : flower.days >= 3 ? "実ができた" : "実になる途中") : "実ができない";
      const message = flower.pollen
        ? "花粉がめしべにつく受粉があると、時間がたって実や種子ができます。"
        : "受粉していない花では、実ができる変化は見られません。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "受粉", value: flower.pollen ? `あり（${flower.source}）` : "なし" },
        { label: "経過", value: `${flower.days}日` },
        { label: "実", value: result }
      ], message });
    }

    function addModeControls() {
      ui.panel.innerHTML = "";
      const modeSection = core.section(ui.panel, "見る内容");
      core.options(modeSection, { label: "LAB", values: [{ id: "growth", label: "発芽と成長" }, { id: "flower", label: "花から実へ" }], value: mode, onChange: next => { mode = next; addModeControls(); paint(); } });
      if (mode === "growth") {
        const germination = core.section(ui.panel, "発芽の条件", "発芽に必要な3条件");
        core.options(germination, { label: "水", values: boolOption, value: growth.water ? "yes" : "no", onChange: value => { growth.water = value === "yes"; paint(); } });
        core.options(germination, { label: "空気", values: boolOption, value: growth.air ? "yes" : "no", onChange: value => { growth.air = value === "yes"; paint(); } });
        core.range(germination, { label: "温度", min: 5, max: 35, value: growth.temperature, format: value => `${value}℃`, onInput: value => { growth.temperature = value; paint(); } });
        const growthSection = core.section(ui.panel, "成長と時間");
        core.options(growthSection, { label: "日光", values: boolOption, value: growth.light ? "yes" : "no", onChange: value => { growth.light = value === "yes"; paint(); } });
        core.range(growthSection, { label: "経過日数", min: 0, max: 10, value: growth.days, format: value => `${value}日`, onInput: value => { growth.days = value; paint(); } });
        core.presets(ui.panel, [
          { id: "germinate", label: "発芽条件OK" }, { id: "no-water", label: "水なし" }, { id: "no-light", label: "日光なし" }
        ], applyPreset);
      } else {
        const pollen = core.section(ui.panel, "受粉を操作", "花粉の移動を試してみよう");
        core.action(pollen, "虫が花粉を運ぶ", () => { flower.pollen = true; flower.source = "虫"; paint(); }, "control-action");
        core.action(pollen, "人が花粉をつける", () => { flower.pollen = true; flower.source = "人"; paint(); }, "control-action");
        core.action(pollen, "花粉をつけない", () => { flower.pollen = false; flower.source = "なし"; paint(); }, "control-action");
        const time = core.section(ui.panel, "時間を進める");
        core.range(time, { label: "経過日数", min: 0, max: 7, value: flower.days, format: value => `${value}日`, onInput: value => { flower.days = value; paint(); } });
        core.presets(ui.panel, [{ id: "pollinate", label: "人が受粉" }, { id: "no-pollinate", label: "受粉なし" }], applyPreset);
      }
    }

    function applyPreset(id) {
      if (mode === "growth") {
        Object.assign(growth, id === "no-water" ? { ...DEFAULT_GROWTH, water: false } : id === "no-light" ? { ...DEFAULT_GROWTH, light: false, days: 8 } : { ...DEFAULT_GROWTH, days: 5 });
      } else {
        Object.assign(flower, id === "no-pollinate" ? { ...DEFAULT_FLOWER, days: 5 } : { ...DEFAULT_FLOWER, pollen: true, source: "人", days: 5 });
      }
      addModeControls();
      paint();
    }

    function paint() { mode === "growth" ? paintGrowth() : paintFlower(); }
    core.action(ui.actions, "1日進める", () => {
      if (mode === "growth") growth.days = Math.min(10, growth.days + 1);
      else flower.days = Math.min(7, flower.days + 1);
      addModeControls();
      paint();
    }, "primary-button");
    core.action(ui.actions, "最初に戻す", () => { Object.assign(growth, DEFAULT_GROWTH); Object.assign(flower, DEFAULT_FLOWER); addModeControls(); paint(); }, "secondary-button");
    ui.note.textContent = "発芽のモデルは、水・空気・適した温度を発芽条件、日光を発芽後の成長条件として分けて表示しています。";
    addModeControls();
    paint();
    return () => ui.destroy();
  }

  window.RikaFiveSimulations.plants = { mount };
})();

/* --- labs/animals-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { days: 0, magnification: 2 };

  function stageFor(days) {
    if (days >= 9) return { name: "稚魚", detail: "卵からかえり、泳ぎ始める", progress: 1, eyes: true, body: true, hatched: true };
    if (days >= 7) return { name: "ふ化直前", detail: "目・体・尾がはっきりする", progress: .86, eyes: true, body: true, hatched: false };
    if (days >= 4) return { name: "体ができる", detail: "目や体の形が見えてくる", progress: .55, eyes: true, body: true, hatched: false };
    if (days >= 2) return { name: "細胞が増える", detail: "卵の中で体がつくられ始める", progress: .25, eyes: false, body: false, hatched: false };
    return { name: "受精卵", detail: "これから細胞が分かれていく", progress: .06, eyes: false, body: false, hatched: false };
  }

  function fishSvg(state, stage) {
    const scale = state.magnification / 2;
    const eggR = stage.hatched ? 0 : 62;
    const body = stage.body ? `<path class="egg-fish" d="M335 174c34-42 98-26 119 8-20 32-83 47-119 8l-35 23 11-33-11-33z"/><circle class="egg-eye" cx="409" cy="175" r="7"/>` : "";
    const cells = !stage.body ? Array.from({ length: state.days >= 2 ? Math.min(8, 2 + state.days) : 1 }, (_, i) => `<circle class="egg-cell" cx="${370 + Math.cos(i * 1.3) * 28}" cy="${175 + Math.sin(i * 1.3) * 28}" r="${state.days >= 2 ? 10 : 25}"/>`).join("") : "";
    const fry = stage.hatched ? `<path class="fry" d="M319 179c42-33 107-19 127 4-24 32-84 38-127 6l-45 18 23-27-13-31z"/><circle class="egg-eye" cx="407" cy="178" r="7"/>` : "";
    return `<svg class="egg-sim-svg" viewBox="0 0 760 360" role="img" aria-label="メダカの卵が成長するシミュレーション">
      <rect width="760" height="360" fill="#eef8fb"/><path class="water-line" d="M0 78q45-20 90 0t90 0 90 0 90 0 90 0 90 0 90 0"/><path class="water-line second" d="M0 306q45-20 90 0t90 0 90 0 90 0 90 0 90 0 90 0"/>
      ${!stage.hatched ? `<circle class="egg-shell" cx="380" cy="175" r="${eggR}"/><g transform="translate(${(1 - scale) * 150} ${(1 - scale) * 80}) scale(${scale})">${cells}${body}</g>` : fry}
      <text class="egg-title" x="380" y="42" text-anchor="middle">${stage.name}</text><text class="egg-caption" x="380" y="314" text-anchor="middle">${stage.detail}</text>
      ${stage.eyes ? `<text class="egg-callout" x="535" y="120">目が見える</text>` : ""}${stage.hatched ? `<text class="egg-callout" x="535" y="235">ふ化して稚魚に</text>` : ""}
    </svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    let dayRange;

    function paint() {
      const stage = stageFor(state.days);
      ui.stage.innerHTML = fishSvg(state, stage);
      const message = stage.hatched ? "時間を進めると、卵の中の変化を経て、ふ化して稚魚になります。" : "受精卵は、細胞が増え、目や体ができ、最後にふ化します。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "経過", value: `${state.days}日` },
        { label: "観察", value: stage.name },
        { label: "倍率", value: `${state.magnification}倍` }
      ], message });
    }

    function buildControls() {
      ui.panel.innerHTML = "";
      const time = core.section(ui.panel, "時間を進める", "卵の中の変化を日ごとに観察");
      dayRange = core.range(time, { label: "経過日数", min: 0, max: 10, value: state.days, format: value => `${value}日`, onInput: value => { state.days = value; paint(); } });
      const observe = core.section(ui.panel, "観察倍率");
      core.options(observe, { label: "倍率", values: [{ id: "1", label: "1倍" }, { id: "2", label: "2倍" }, { id: "4", label: "4倍" }], value: state.magnification, onChange: value => { state.magnification = Number(value); paint(); } });
      core.presets(ui.panel, [{ id: "egg", label: "受精直後" }, { id: "eye", label: "目が見える" }, { id: "fry", label: "稚魚" }], id => {
        state.days = id === "egg" ? 0 : id === "eye" ? 4 : 9;
        buildControls();
        paint();
      });
    }

    buildControls();
    core.action(ui.actions, "1日進める", () => { state.days = Math.min(10, state.days + 1); dayRange.set(state.days); paint(); }, "primary-button");
    core.action(ui.actions, "最初に戻す", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "卵の中の変化を、学習内容に合わせて「細胞が増える → 体ができる → ふ化 → 稚魚」の順で表しています。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.animals = { mount };
})();

/* --- labs/weather-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { time: 0, motion: true, wind: "west-east", map: true, station: "central" };
  const STATIONS = [{ id: "west", label: "西の地点", x: 170 }, { id: "central", label: "中央の地点", x: 380 }, { id: "east", label: "東の地点", x: 590 }];

  function weatherAt(time, stationIndex, direction, motion) {
    if (!motion || direction === "north") return "晴れ";
    const arrival = direction === "west-east" ? stationIndex * 2 : (2 - stationIndex) * 2;
    const delta = time - arrival;
    if (delta < 0) return "晴れ";
    if (delta < 2) return "くもり";
    if (delta < 4) return "雨";
    return "晴れ";
  }

  function cloudPosition(state) {
    if (!state.motion || state.wind === "north") return 380;
    return state.wind === "west-east" ? Math.min(650, 115 + state.time * 67) : Math.max(110, 645 - state.time * 67);
  }

  function weatherSvg(state) {
    const cloudX = cloudPosition(state);
    const directionLabel = state.wind === "west-east" ? "西 → 東" : state.wind === "east-west" ? "東 → 西" : "南 → 北";
    const stationMarkup = STATIONS.map((station, index) => {
      const value = weatherAt(state.time, index, state.wind, state.motion);
      const selected = station.id === state.station;
      return `<g class="weather-station ${selected ? "selected" : ""}"><circle cx="${station.x}" cy="234" r="${selected ? 18 : 13}"/><text x="${station.x}" y="276" text-anchor="middle">${station.label}</text><text class="weather-value" x="${station.x}" y="216" text-anchor="middle">${value}</text></g>`;
    }).join("");
    return `<svg class="weather-sim-svg" viewBox="0 0 760 360" role="img" aria-label="西から東へ移る雲と各地点の天気">
      <defs><linearGradient id="weather-sky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#cfeafa"/><stop offset="1" stop-color="#f8fbfd"/></linearGradient></defs>
      <rect width="760" height="360" fill="url(#weather-sky)"/><circle class="weather-sun" cx="90" cy="70" r="28"/>
      ${state.map ? `<path class="weather-map-line" d="M110 210 Q185 185 260 208 T410 207 T560 195 T675 215"/><text class="weather-map-label" x="104" y="135">天気図：${directionLabel}</text>` : `<text class="weather-map-label" x="104" y="135">雲の観察：${directionLabel}</text>`}
      <g class="weather-cloud" transform="translate(${cloudX} 112)"><circle cx="0" cy="20" r="28"/><circle cx="32" cy="2" r="38"/><circle cx="72" cy="20" r="27"/><rect x="0" y="20" width="72" height="26" rx="13"/><text x="36" y="76" text-anchor="middle">雲</text></g>
      <path class="weather-arrow" d="M130 92 H${state.wind === "east-west" ? 610 : 640}"/><path class="weather-arrow-head" d="m${state.wind === "east-west" ? 140 : 630} 83 16 9-16 9"/>
      ${stationMarkup}<text class="weather-time" x="650" y="332" text-anchor="end">${state.time}時間後</text>
    </svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    let timeRange;
    function paint() {
      const stationIndex = STATIONS.findIndex(item => item.id === state.station);
      const current = weatherAt(state.time, stationIndex, state.wind, state.motion);
      const direction = state.wind === "west-east" ? "西から東" : state.wind === "east-west" ? "東から西" : "南から北";
      ui.stage.innerHTML = weatherSvg(state);
      core.renderReadout(ui.readout, { metrics: [
        { label: "観察地点", value: STATIONS[stationIndex].label },
        { label: "現在の天気", value: current },
        { label: "経過", value: `${state.time}時間後` }
      ], message: state.motion && state.wind === "west-east" ? "雲と天気は、西から東へ変化していきます。" : state.motion ? `風向きを${direction}にすると、雲の動きと天気の順番も変わります。` : "雲を止めると、各地点の天気の変化も止まります。", note: `風向き：${direction}　／　天気図：${state.map ? "表示" : "非表示"}` });
    }
    function buildControls() {
      ui.panel.innerHTML = "";
      const time = core.section(ui.panel, "時間を進める");
      timeRange = core.range(time, { label: "経過時間", min: 0, max: 8, value: state.time, format: value => `${value}時間後`, onInput: value => { state.time = value; paint(); } });
      const cloud = core.section(ui.panel, "雲の動き");
      core.options(cloud, { label: "動き", values: [{ id: "move", label: "動く" }, { id: "stop", label: "止める" }], value: state.motion ? "move" : "stop", onChange: value => { state.motion = value === "move"; paint(); } });
      const wind = core.section(ui.panel, "風向き");
      core.options(wind, { label: "風", values: [{ id: "west-east", label: "西→東" }, { id: "east-west", label: "東→西" }, { id: "north", label: "南→北" }], value: state.wind, onChange: value => { state.wind = value; paint(); } });
      const map = core.section(ui.panel, "表示");
      core.options(map, { label: "天気図", values: [{ id: "show", label: "表示" }, { id: "hide", label: "非表示" }], value: state.map ? "show" : "hide", onChange: value => { state.map = value === "show"; paint(); } });
      const point = core.section(ui.panel, "観察地点");
      core.options(point, { label: "地点", values: STATIONS.map(item => ({ id: item.id, label: item.label.replace("の地点", "") })), value: state.station, onChange: value => { state.station = value; paint(); } });
      core.presets(ui.panel, [{ id: "normal", label: "西→東" }, { id: "reverse", label: "東→西" }, { id: "map", label: "天気図ON" }], id => { Object.assign(state, id === "reverse" ? { ...DEFAULT, wind: "east-west", time: 3 } : id === "map" ? { ...DEFAULT, time: 2, map: true } : { ...DEFAULT, time: 3 }); buildControls(); paint(); });
    }
    buildControls();
    core.action(ui.actions, "1時間進める", () => { state.time = Math.min(8, state.time + 1); timeRange.set(state.time); paint(); }, "primary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "天気の変化は、雲が動く方向と観察地点を比べるための簡易モデルです。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.weather = { mount };
})();

/* --- labs/river-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { speed: 3, slope: 3, amount: 3, sediment: "sand", width: 3, time: 0, flow: 0 };
  const SEDIMENTS = [{ id: "gravel", label: "れき" }, { id: "sand", label: "砂" }, { id: "mud", label: "泥" }];

  function model(state) {
    const energy = state.speed * state.slope * state.amount / 5;
    const resistance = state.sediment === "gravel" ? 1.25 : state.sediment === "mud" ? .7 : 1;
    const erosion = Math.min(100, Math.round(energy * 7 * resistance + state.flow * 4));
    const transport = Math.min(100, Math.round((state.speed * state.amount * 5 + state.flow * 3) * resistance));
    const deposition = Math.min(100, Math.max(0, Math.round((6 - state.speed) * 12 + (6 - state.slope) * 5 + state.width * 2 - state.flow * 2)));
    return { energy, erosion, transport, deposition };
  }

  function riverSvg(state, result) {
    const particleCount = Math.min(16, 4 + state.flow + state.speed);
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const x = 86 + (i * 43) % 590;
      const y = 112 + Math.sin(i * 1.8) * 22;
      return `<circle class="river-particle ${state.sediment}" cx="${x}" cy="${y}" r="${state.sediment === "gravel" ? 5 : state.sediment === "mud" ? 3 : 4}" style="--delay:${i * -0.15}s"/>`;
    }).join("");
    const deposit = Math.min(105, 18 + result.deposition * .9);
    const erode = Math.min(44, 10 + result.erosion * .32);
    return `<svg class="river-sim-svg" viewBox="0 0 760 360" role="img" aria-label="流れる水が土地をけずり土砂を運びたい積させるシミュレーション">
      <rect width="760" height="360" fill="#eaf5e5"/><path class="river-land" d="M0 0H760V82c-100 18-176 4-263 22-90 18-170 5-252 20C160 136 78 128 0 146Z"/><path class="river-land bottom" d="M0 248c111-25 181-3 269-16 89-13 161 5 247-10 95-17 159-1 244-17V360H0Z"/>
      <path class="river-water" d="M0 155 C130 128 190 196 303 166 S495 123 760 174"/><path class="river-flow-line" d="M35 153 C155 133 202 184 303 163 S500 131 718 169"/>
      ${particles}<path class="river-eroded" d="M85 145q33-${erode / 2} 65 0v${erode}H85Z"/><path class="river-deposit" d="M604 171q56-${deposit / 2} 105 0v${deposit}H604Z"/>
      <text class="river-zone" x="76" y="46">上流：けずる</text><text class="river-zone" x="336" y="48">中流：運ぶ</text><text class="river-zone" x="590" y="46">下流：たい積</text>
      <text class="river-callout" x="118" y="316">けずられた場所</text><text class="river-callout" x="614" y="316">土砂がたまる場所</text><text class="river-speed" x="690" y="344" text-anchor="end">流れ ${state.speed}/5</text>
    </svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    let timeRange;
    function paint() {
      const result = model(state);
      ui.stage.innerHTML = riverSvg(state, result);
      let message = result.erosion > result.deposition ? "流れが速いほど、けずる・運ぶ力が大きくなります。" : "流れがゆるやかな場所では、運ばれた土砂がたい積します。";
      if (state.flow) message += " 水を流した回数が増えるほど、川の形の変化も大きくなります。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "けずる力", value: `${result.erosion}/100` },
        { label: "運ぶ土砂", value: `${result.transport}/100`, detail: SEDIMENTS.find(item => item.id === state.sediment).label },
        { label: "たい積", value: `${result.deposition}/100` }
      ], message, note: `水を流した回数：${state.flow}回　／　川幅：${state.width}` });
    }
    function buildControls() {
      ui.panel.innerHTML = "";
      const flow = core.section(ui.panel, "流れの条件");
      core.range(flow, { label: "水の流れる速さ", min: 1, max: 5, value: state.speed, format: value => `${value}/5`, onInput: value => { state.speed = value; paint(); } });
      core.range(flow, { label: "川の傾き", min: 1, max: 5, value: state.slope, format: value => `${value}/5`, onInput: value => { state.slope = value; paint(); } });
      core.range(flow, { label: "水の量", min: 1, max: 5, value: state.amount, format: value => `${value}/5`, onInput: value => { state.amount = value; paint(); } });
      core.range(flow, { label: "川幅", min: 1, max: 5, value: state.width, format: value => `${value}/5`, onInput: value => { state.width = value; paint(); } });
      const sediment = core.section(ui.panel, "土砂の種類");
      core.options(sediment, { label: "土砂", values: SEDIMENTS, value: state.sediment, onChange: value => { state.sediment = value; paint(); } });
      const time = core.section(ui.panel, "時間");
      timeRange = core.range(time, { label: "経過時間", min: 0, max: 10, value: state.time, format: value => `${value}分`, onInput: value => { state.time = value; state.flow = Math.max(state.flow, Math.floor(value / 2)); paint(); } });
      core.presets(ui.panel, [{ id: "erosion", label: "速い流れ" }, { id: "deposit", label: "ゆるやかな流れ" }, { id: "gravel", label: "れきを運ぶ" }], id => { Object.assign(state, id === "deposit" ? { ...DEFAULT, speed: 1, slope: 1, amount: 2 } : id === "gravel" ? { ...DEFAULT, speed: 4, slope: 4, amount: 4, sediment: "gravel" } : { ...DEFAULT, speed: 5, slope: 4, amount: 4 }); buildControls(); paint(); });
    }
    buildControls();
    core.action(ui.actions, "水を流す", () => { state.flow = Math.min(10, state.flow + 1); state.time = Math.min(10, state.time + 1); timeRange.set(state.time); paint(); }, "primary-button");
    core.action(ui.actions, "時間を進める", () => { state.time = Math.min(10, state.time + 1); timeRange.set(state.time); paint(); }, "secondary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "川の上流・中流・下流を一つのモデルに置き、水の速さや量が変わったときの傾向を見えるようにしています。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.river = { mount };
})();

/* --- labs/solutions-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { water: 100, temperature: 25, amount: 20, stirred: false, substance: "salt", time: 5, evaporated: false };
  const SUBSTANCES = [{ id: "salt", label: "食塩" }, { id: "alum", label: "ミョウバン" }];

  function capacity(state) {
    const per100 = state.substance === "salt" ? 36 + (state.temperature - 20) * .06 : Math.max(4, 10 + (state.temperature - 20) * .9);
    return Math.max(1, Math.round(per100 * state.water / 100));
  }
  function solutionModel(state) {
    const max = capacity(state);
    const speed = (state.temperature / 80 + (state.stirred ? .65 : .25)) * (state.time / 10) + .08;
    const dissolved = Math.min(state.amount, max, Math.round(max * Math.min(1, speed) * 10) / 10);
    return { max, dissolved, leftover: Math.max(0, Math.round((state.amount - dissolved) * 10) / 10), progress: max ? dissolved / Math.min(state.amount, max) : 0 };
  }

  function solutionSvg(state, model) {
    const particles = Array.from({ length: 28 }, (_, i) => {
      const dissolvedCount = Math.round(model.progress * 28);
      const dissolved = i < dissolvedCount;
      const x = 290 + (i * 47) % 180;
      const y = 176 + (i * 31) % 95;
      return `<circle class="solution-dot ${dissolved ? "dissolved" : "leftover"}" cx="${x}" cy="${y}" r="${dissolved ? 4 : 6}"/>`;
    }).join("");
    if (state.evaporated) return `<svg class="solution-sim-svg" viewBox="0 0 760 360" role="img" aria-label="水を蒸発させた後に物質が残るシミュレーション"><rect width="760" height="360" fill="#fbf6ed"/><ellipse class="dish" cx="380" cy="250" rx="190" ry="35"/><path class="dish-side" d="M190 250q25 65 190 65t190-65"/><g class="crystals">${Array.from({ length: Math.min(28, Math.ceil(model.dissolved + model.leftover)) }, (_, i) => `<rect x="${250 + (i * 43) % 260}" y="${220 - (i % 4) * 9}" width="${8 + i % 5}" height="${8 + i % 4}" rx="2"/>`).join("")}</g><text class="solution-title" x="380" y="55" text-anchor="middle">水を蒸発させたあと</text><text class="solution-caption" x="380" y="335" text-anchor="middle">とけていた物質が、結晶として残る</text></svg>`;
    return `<svg class="solution-sim-svg" viewBox="0 0 760 360" role="img" aria-label="水に物質がとけるシミュレーション"><defs><linearGradient id="solution-water" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#d5f2f4"/><stop offset="1" stop-color="#8ccbd3"/></linearGradient></defs><rect width="760" height="360" fill="#eef8f8"/><path class="beaker" d="M260 55h240M278 55v215q0 28 28 28h108q28 0 28-28V55"/><path class="beaker-water" d="M279 160h202v111q0 27-27 27H306q-27 0-27-27Z" fill="url(#solution-water)"/>${particles}<text class="solution-title" x="380" y="35" text-anchor="middle">${SUBSTANCES.find(item => item.id === state.substance).label}が水に広がる</text><text class="solution-caption" x="380" y="335" text-anchor="middle">${state.stirred ? "かき混ぜている" : "かき混ぜていない"}　・　${state.temperature}℃</text></svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    let evaporateButton;
    let timeRange;
    function paint() {
      const model = solutionModel(state);
      ui.stage.innerHTML = solutionSvg(state, model);
      const substance = SUBSTANCES.find(item => item.id === state.substance).label;
      let message;
      if (state.evaporated) message = "水を蒸発させても、物質そのものがなくなるわけではありません。結晶として残ります。";
      else if (state.stirred && state.time < 10) message = "かき混ぜると、とける速さは上がりますが、最終的にとける量が増えるわけではありません。";
      else if (model.leftover > 0 && model.dissolved >= model.max) message = "とける限度まで広がり、これ以上はとけ残ります。水の量・温度・物質で限度が変わります。";
      else if (model.leftover > 0) message = `この条件では${model.leftover}gがとけ残ります。水の量や温度を変えると、とける量も変わります。`;
      else message = "この時間では、入れた物質がすべて水に広がっています。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "とけた量", value: `${model.dissolved}g` },
        { label: "とけ残り", value: `${model.leftover}g` },
        { label: "最終的にとける量", value: `${model.max}g`, detail: `${substance}・${state.water}mL` },
        { label: "状態", value: model.leftover > 0 && model.dissolved >= model.max ? "飽和" : "未飽和" },
        { label: "水溶液全体の重さ", value: `${state.water + state.amount}g` }
      ], message, note: state.evaporated ? `蒸発後に残る物質：${state.amount}g` : `時間：${state.time}/10　／　温度：${state.temperature}℃` });
      if (evaporateButton) evaporateButton.textContent = state.evaporated ? "水に戻す" : "水を蒸発させる";
    }
    function buildControls() {
      ui.panel.innerHTML = "";
      const water = core.section(ui.panel, "水と物質の条件");
      core.range(water, { label: "水の量", min: 50, max: 300, step: 10, value: state.water, format: value => `${value}mL`, onInput: value => { state.water = value; state.evaporated = false; paint(); } });
      core.range(water, { label: "水の温度", min: 10, max: 80, value: state.temperature, format: value => `${value}℃`, onInput: value => { state.temperature = value; state.evaporated = false; paint(); } });
      core.range(water, { label: "とかす物質", min: 5, max: 60, step: 5, value: state.amount, format: value => `${value}g`, onInput: value => { state.amount = value; state.evaporated = false; paint(); } });
      core.options(water, { label: "物質", values: SUBSTANCES, value: state.substance, onChange: value => { state.substance = value; state.evaporated = false; paint(); } });
      const action = core.section(ui.panel, "とかし方と時間");
      core.options(action, { label: "かき混ぜ", values: [{ id: "no", label: "しない" }, { id: "yes", label: "する" }], value: state.stirred ? "yes" : "no", onChange: value => { state.stirred = value === "yes"; paint(); } });
      timeRange = core.range(action, { label: "経過", min: 0, max: 10, value: state.time, format: value => `${value}/10`, onInput: value => { state.time = value; paint(); } });
      core.presets(ui.panel, [{ id: "stir", label: "かき混ぜる" }, { id: "hot", label: "温度を上げる" }, { id: "alum", label: "ミョウバン" }], id => { Object.assign(state, id === "stir" ? { ...DEFAULT, stirred: true, time: 4 } : id === "hot" ? { ...DEFAULT, temperature: 70, time: 8 } : { ...DEFAULT, substance: "alum", temperature: 60, time: 8 }); buildControls(); paint(); });
    }
    buildControls();
    core.action(ui.actions, "10秒進める", () => { state.time = Math.min(10, state.time + 2); timeRange.set(state.time); paint(); }, "primary-button");
    evaporateButton = core.action(ui.actions, "水を蒸発させる", () => { state.evaporated = !state.evaporated; paint(); }, "secondary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "「かき混ぜる」はとける速さに関係し、「最終的にとける量」は水の量・温度・物質の種類で変わるものとして表示しています。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.solutions = { mount };
})();

/* --- labs/electromagnet-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { turns: 100, current: .5, batteries: 1, core: true, on: true, time: 0 };

  function model(state) {
    const batteryFactor = .8 + state.batteries * .2;
    const strength = state.on ? Math.min(100, Math.round(state.turns / 2.5 * state.current * batteryFactor * (state.core ? 1.45 : .55))) : 0;
    const clips = Math.min(20, Math.floor(strength / 8));
    const range = Math.round(strength / 12);
    return { strength, clips, range };
  }

  function magnetSvg(state, result) {
    const coils = Math.max(5, Math.round(state.turns / 20));
    const coilLines = Array.from({ length: Math.min(18, coils) }, (_, i) => `<path class="coil" d="M${286 + i * 11} 106v116"/>`).join("");
    const clips = Array.from({ length: result.clips }, (_, i) => `<circle class="clip" cx="${270 + (i % 10) * 27}" cy="${278 + Math.floor(i / 10) * 25}" r="8"/>`).join("");
    const field = state.on ? `<ellipse class="magnetic-field" cx="380" cy="164" rx="${115 + result.range * 3}" ry="${75 + result.range * 2}"/>` : "";
    return `<svg class="magnet-sim-svg" viewBox="0 0 760 360" role="img" aria-label="電流とコイルと鉄心で電磁石の強さが変化するシミュレーション"><rect width="760" height="360" fill="#fff8df"/>${field}<rect class="iron-core ${state.core ? "present" : "absent"}" x="270" y="116" width="220" height="96" rx="18"/>${coilLines}<path class="wire-end" d="M286 106V70H205M473 106V70h82"/><circle class="battery" cx="180" cy="70" r="23"/><text class="battery-label" x="180" y="76" text-anchor="middle">${state.batteries}個</text><text class="magnet-title" x="380" y="38" text-anchor="middle">電磁石：${state.on ? "電流が流れている" : "電流を切った"}</text><text class="magnet-label" x="380" y="245" text-anchor="middle">${state.core ? "鉄心あり" : "鉄心なし"}　・　${state.turns}回巻き</text>${clips}<text class="clip-label" x="380" y="340" text-anchor="middle">引きつけたクリップ：${result.clips}個</text></svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    function paint() {
      const result = model(state);
      ui.stage.innerHTML = magnetSvg(state, result);
      const message = !state.on ? "電流を切ると、電磁石の磁力はほとんどなくなります。" : state.core ? "コイルの巻き数・電流・鉄心を大きくすると、電磁石は強くなります。" : "鉄心を入れると、同じコイルと電流でも磁力の範囲が大きくなります。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "電磁石の強さ", value: `${result.strength}/100` },
        { label: "クリップ", value: `${result.clips}個` },
        { label: "磁力の範囲", value: `${result.range}cm` }
      ], message, note: `電流：${state.current.toFixed(1)}A　／　電池：${state.batteries}個　／　流した時間：${state.time}秒` });
    }
    function buildControls() {
      ui.panel.innerHTML = "";
      const coil = core.section(ui.panel, "コイルと電流");
      core.range(coil, { label: "コイルの巻き数", min: 50, max: 250, step: 10, value: state.turns, format: value => `${value}回`, onInput: value => { state.turns = value; paint(); } });
      core.range(coil, { label: "電流の強さ", min: .1, max: 1, step: .1, value: state.current, format: value => `${Number(value).toFixed(1)}A`, onInput: value => { state.current = value; paint(); } });
      core.options(coil, { label: "電池の数", values: [{ id: "1", label: "1個" }, { id: "2", label: "2個" }, { id: "3", label: "3個" }], value: state.batteries, onChange: value => { state.batteries = Number(value); paint(); } });
      const coreSection = core.section(ui.panel, "鉄心と電流");
      core.options(coreSection, { label: "鉄心", values: [{ id: "yes", label: "あり" }, { id: "no", label: "なし" }], value: state.core ? "yes" : "no", onChange: value => { state.core = value === "yes"; paint(); } });
      core.options(coreSection, { label: "電流", values: [{ id: "on", label: "流す" }, { id: "off", label: "切る" }], value: state.on ? "on" : "off", onChange: value => { state.on = value === "on"; paint(); } });
      core.presets(ui.panel, [{ id: "turns", label: "巻き数UP" }, { id: "iron", label: "鉄心あり" }, { id: "off", label: "電流を切る" }], id => { Object.assign(state, id === "turns" ? { ...DEFAULT, turns: 220 } : id === "iron" ? { ...DEFAULT, core: true } : { ...DEFAULT, on: false }); buildControls(); paint(); });
    }
    buildControls();
    core.action(ui.actions, "5秒流す", () => { state.on = true; state.time = Math.min(30, state.time + 5); paint(); }, "primary-button");
    core.action(ui.actions, "電流を切る", () => { state.on = false; paint(); }, "secondary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "電池の数は電流を大きくする要因として扱い、巻き数・電流・鉄心を変えたときの磁力の変化を比べます。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.electromagnet = { mount };
})();

/* --- labs/pendulum-lab.js --- */
(() => {
  "use strict";
  window.RikaFiveSimulations = window.RikaFiveSimulations || {};
  const DEFAULT = { length: 40, weight: 100, amplitude: 15, count: 10, measuring: false, measured: 0 };

  function model(state) {
    const base = 2 * Math.PI * Math.sqrt((state.length / 100) / 9.8);
    const amplitudeFactor = 1 + Math.max(0, state.amplitude - 20) * .001;
    const period = Math.round(base * amplitudeFactor * 100) / 100;
    const total = Math.round(period * state.count * 100) / 100;
    return { period, total };
  }

  function pendulumSvg(state, result) {
    const angle = state.measuring ? 0 : Math.sin(Date.now() / 430) * state.amplitude;
    return `<svg class="pendulum-sim-svg" viewBox="0 0 760 360" role="img" aria-label="ふりこの長さや重さや振れ幅を変えるシミュレーション"><rect width="760" height="360" fill="#f3effb"/><path class="pendulum-frame" d="M270 52h220M300 52v35M460 52v35"/><path class="pendulum-string" d="M380 70v${210 - Math.min(100, state.length)}" transform="rotate(${angle} 380 70)"/><circle class="pendulum-bob" cx="380" cy="${280 - Math.min(100, state.length)}" r="${18 + state.weight / 25}" transform="rotate(${angle} 380 70)"/><path class="angle-guide" d="M300 90q80 55 160 0"/><text class="pendulum-title" x="380" y="34" text-anchor="middle">ふりこの動き</text><text class="pendulum-label" x="380" y="328" text-anchor="middle">長さ ${state.length}cm　・　おもり ${state.weight}g　・　振れ幅 ${state.amplitude}°</text></svg>`;
  }

  function mount(root, { core, host, manifest }) {
    const ui = core.shell(root, manifest, { onHome: host.onHome });
    const state = { ...DEFAULT };
    let animationFrame = 0;
    let countOptions;
    const animate = () => {
      if (!state.measuring) return;
      paint();
      animationFrame = requestAnimationFrame(animate);
    };
    function paint() {
      const result = model(state);
      ui.stage.innerHTML = pendulumSvg(state, result);
      let message;
      if (state.length !== DEFAULT.length) message = "ふりこの長さを長くすると、1往復する時間が長くなります。";
      else if (state.weight !== DEFAULT.weight) message = "同じ長さなら、おもりの重さを変えても1往復する時間はほぼ変わりません。";
      else if (state.amplitude !== DEFAULT.amplitude) message = "小さな振れ幅では、振れ幅を変えても1往復する時間はほぼ変わりません。";
      else message = "長さ・重さ・振れ幅を一つずつ変えて、周期の変化を比べてみましょう。";
      core.renderReadout(ui.readout, { metrics: [
        { label: "1往復の時間", value: `${result.period}秒` },
        { label: `${state.count}往復の時間`, value: `${result.total}秒` },
        { label: "測定", value: state.measured ? `${state.measured}秒` : "ボタンで測る" }
      ], message, note: "測定は、同じ条件で同じ回数を比べるための目安です。" });
    }
    function buildControls() {
      ui.panel.innerHTML = "";
      const conditions = core.section(ui.panel, "ふりこの条件");
      core.range(conditions, { label: "ふりこの長さ", min: 20, max: 100, step: 10, value: state.length, format: value => `${value}cm`, onInput: value => { state.length = value; state.measured = 0; paint(); } });
      core.range(conditions, { label: "おもりの重さ", min: 50, max: 200, step: 10, value: state.weight, format: value => `${value}g`, onInput: value => { state.weight = value; state.measured = 0; paint(); } });
      core.range(conditions, { label: "ふれ幅", min: 5, max: 30, value: state.amplitude, format: value => `${value}°`, onInput: value => { state.amplitude = value; state.measured = 0; paint(); } });
      const measure = core.section(ui.panel, "測る回数");
      countOptions = core.options(measure, { label: "振る回数", values: [{ id: "1", label: "1往復" }, { id: "10", label: "10往復" }, { id: "20", label: "20往復" }], value: state.count, onChange: value => { state.count = Number(value); state.measured = 0; paint(); } });
      core.presets(ui.panel, [{ id: "length", label: "長さを比べる" }, { id: "weight", label: "重さを比べる" }, { id: "amplitude", label: "振れ幅を比べる" }], id => { Object.assign(state, id === "length" ? { ...DEFAULT, length: 80 } : id === "weight" ? { ...DEFAULT, weight: 200 } : { ...DEFAULT, amplitude: 28 }); buildControls(); paint(); });
    }
    buildControls();
    core.action(ui.actions, "10往復を測る", () => { const result = model({ ...state, count: 10 }); state.count = 10; state.measured = result.total; state.measuring = true; countOptions.set(10); paint(); cancelAnimationFrame(animationFrame); animationFrame = requestAnimationFrame(animate); }, "primary-button");
    core.action(ui.actions, "振らせる / 止める", () => { state.measuring = !state.measuring; paint(); cancelAnimationFrame(animationFrame); if (state.measuring) animationFrame = requestAnimationFrame(animate); }, "secondary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); cancelAnimationFrame(animationFrame); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "ふりこの長さ・おもりの重さ・振れ幅を同時に変えず、一つずつ変化を確かめられるようにしています。";
    paint();
    return () => { cancelAnimationFrame(animationFrame); ui.destroy(); };
  }
  window.RikaFiveSimulations.pendulum = { mount };
})();

/* --- labs/index.js --- */
(() => {
  "use strict";

  const MANIFESTS = {
    plants: { id: "plants", title: "植物LAB", unit: "植物の発芽と成長", summary: "発芽に必要な条件と、成長・受粉の変化を時間で見ます。", accent: "#3f8052", script: "labs/plants-lab.js" },
    animals: { id: "animals", title: "魚のたんじょうLAB", unit: "メダカ・人のたんじょう", summary: "卵の中の変化を日ごとに進め、ふ化から稚魚まで観察します。", accent: "#397aa7", script: "labs/animals-lab.js" },
    weather: { id: "weather", title: "天気LAB", unit: "天気の変化", summary: "雲の動きと観察地点を変えて、天気の移り変わりを見ます。", accent: "#5883a0", script: "labs/weather-lab.js" },
    river: { id: "river", title: "流れる水LAB", unit: "流れる水のはたらき", summary: "水を流し、けずる・運ぶ・たい積する場所の変化を見ます。", accent: "#2d86a6", script: "labs/river-lab.js" },
    solutions: { id: "solutions", title: "もののとけ方LAB", unit: "物のとけ方", summary: "水の量・温度・物質を変えて、とける速さと量を比べます。", accent: "#80649b", script: "labs/solutions-lab.js" },
    electromagnet: { id: "electromagnet", title: "電磁石LAB", unit: "電流がつくる磁力", summary: "コイル・電流・鉄心を変えて、電磁石の強さを見ます。", accent: "#bd8a13", script: "labs/electromagnet-lab.js" },
    pendulum: { id: "pendulum", title: "ふりこLAB", unit: "ふりこの運動", summary: "長さ・重さ・振れ幅を変えて、1往復の時間を比べます。", accent: "#7565a3", script: "labs/pendulum-lab.js" }
  };
  const loaded = new Map();
  let activeCleanup = null;

  function loadScript(src) {
    if (loaded.has(src)) return loaded.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    promise.catch(() => loaded.delete(src));
    loaded.set(src, promise);
    return promise;
  }

  function catalog() {
    const units = window.SCIENCE_UNITS || [];
    return `<div class="page lab-catalog-page"><div class="compact-heading"><div><p class="eyebrow">SIMULATION LAB</p><h1>条件を変えて、すぐ確かめる</h1></div><button class="secondary-button" type="button" data-lab-home>単元一覧へ</button></div><div class="lab-card-grid">${units.map(unit => { const lab = MANIFESTS[unit.id]; return lab ? `<button class="lab-card" type="button" data-lab-id="${lab.id}" style="--lab-accent:${lab.accent}"><span class="lab-card-icon">${unit.icon}</span><span class="lab-card-tag">${unit.title}</span><h2>${lab.title}</h2><p>${lab.summary}</p><b>実験を始める →</b></button>` : ""; }).join("")}</div></div>`;
  }

  async function render(id, root, host) {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
    if (!id) { root.innerHTML = catalog(); return null; }
    const manifest = MANIFESTS[id];
    if (!manifest) { root.innerHTML = `<section class="empty-state"><h1>このLABはまだありません</h1><button class="primary-button" type="button" data-lab-home>一覧へ戻る</button></section>`; return null; }
    root.innerHTML = `<section class="lab-loading"><span class="lab-loading-mark" aria-hidden="true">${manifest.title.slice(0, 1)}</span><h1>${manifest.title}を準備しています</h1><p>シミュレーションを読み込んでいます。</p></section>`;
    if (!window.RikaFiveLabCore) await loadScript("labs/lab-core.js");
    if (!window.RikaFiveSimulations?.[id]) await loadScript(manifest.script);
    const factory = window.RikaFiveSimulations?.[id];
    if (!factory) throw new Error("Simulation factory missing");
    activeCleanup = factory.mount(root, { core: window.RikaFiveLabCore, host, manifest }) || null;
    return activeCleanup;
  }

  function leave() { if (activeCleanup) { activeCleanup(); activeCleanup = null; } }

  window.RikaFiveLabRouter = { render, catalog, leave, manifests: MANIFESTS };
})();


/* --- app.js: problem-learning host --- */

(function () {
  const app = document.getElementById("app");
  const notebook = document.getElementById("notebook-dialog");
  const notebookContent = document.getElementById("notebook-content");
  const toast = document.getElementById("toast");
  let view = { page: "home", unitId: null, phase: "knowledge", homeTab: "simulation" };
  let currentSelections = {};
  let toastTimer;

  const phaseMeta = {
    knowledge: { number: "1", label: "知識", sub: "くらべて整理" },
    preparation: { number: "2", label: "実験準備", sub: "条件を制御" },
    consideration: { number: "3", label: "考察", sub: "根拠から判断" }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function unitPercent(id) {
    const p = ProgressStore.getUnit(id);
    return [p.knowledge.done, p.preparation.done, p.consideration.done].filter(Boolean).length / 3 * 100;
  }

  function renderHome(tab) {
    window.RikaFiveLabRouter?.leave?.();
    document.body.classList.remove("has-simulation");
    view = { page: "home", unitId: null, phase: "knowledge", homeTab: tab || view.homeTab || "simulation" };
    const simulation = view.homeTab === "simulation";
    const units = window.SCIENCE_UNITS || [];
    app.innerHTML = `
      <div class="page home-page">
        <section class="home-dashboard-head">
          <div><span class="eyebrow">SCIENCE LABORATORY / GRADE 5</span><h1>理科ラボ5</h1><p>条件を動かして、現象の変化を見つけよう。</p></div>
          <span class="home-count">${units.length}単元</span>
        </section>
        <nav class="home-mode-tabs" role="tablist" aria-label="学習モード">
          <button type="button" role="tab" aria-selected="${simulation}" data-home-tab="simulation" class="${simulation ? "active" : ""}"><span>🔬</span><b>シミュレーション</b><small>条件を変えてすぐ試す</small></button>
          <button type="button" role="tab" aria-selected="${!simulation}" data-home-tab="problems" class="${!simulation ? "active" : ""}"><span>📝</span><b>問題を解く</b><small>知識・実験・考察を学ぶ</small></button>
        </nav>
        <div class="section-heading compact-heading"><div><span class="eyebrow">${simulation ? "TRY THE MODEL" : "LEARN THE UNIT"}</span><h2>${simulation ? "試したい単元を選ぼう" : "学びたい単元を選ぼう"}</h2></div><p>${simulation ? "操作すると図と結果がすぐ変わります" : "学習記録はこの端末に保存されます"}</p></div>
        <section class="unit-grid ${simulation ? "simulation-grid" : "problem-grid"}" role="tabpanel" aria-label="${simulation ? "シミュレーション" : "問題"}の単元一覧">
          ${units.map(unit => simulation ? renderSimulationCard(unit) : renderUnitCard(unit)).join("")}
        </section>
        ${window.ScienceGame ? `<section class="home-extras" aria-label="理科ラボのおまけ要素"><div class="home-extras-heading"><span class="eyebrow">EXTRA COLLECTION</span><h2>おまけ要素</h2><p>学習の合間に、発見やバッジを集めよう。</p></div>${window.ScienceGame.panel()}</section>` : ""}
      </div>`;

    app.querySelectorAll("[data-home-tab]").forEach(button => button.addEventListener("click", () => renderHome(button.dataset.homeTab)));
    app.querySelectorAll("button.unit-card").forEach(button => button.addEventListener("click", () => openUnit(button.dataset.unit)));
    app.querySelectorAll("[data-simulation]").forEach(button => button.addEventListener("click", () => openSimulation(button.dataset.simulation)));
    history.replaceState(null, "", `#home/${view.homeTab}`);
  }

  function renderUnitCard(unit) {
    const percent = unit.available ? unitPercent(unit.id) : 0;
    const progress = unit.available ? ProgressStore.getUnit(unit.id) : null;
    const status = !unit.available ? "準備中" : progress.cleared ? "クリア" : percent ? "学習中" : "学べます";
    const statusClass = progress?.cleared ? "clear" : unit.available ? "active" : "";
    const tag = unit.available ? "button" : "article";
    return `<${tag} class="unit-card ${unit.available ? "" : "locked"}" ${unit.available ? `type="button" data-unit="${unit.id}"` : ""} style="--unit-color:${unit.color}">
      <div class="unit-top"><span class="unit-icon">${unit.icon}</span><span class="status-badge ${statusClass}">${status}</span></div>
      <h3><small>${unit.number}</small> ${unit.title}</h3>
      <p>${unit.description}</p>
      <div class="card-progress">
        <div class="progress-bar" aria-label="進み具合 ${Math.round(percent)}%"><span style="--progress:${percent}%"></span></div>
        <div class="progress-label"><span>問題の進み具合</span><span>${Math.round(percent)}%</span></div>
      </div>
    </${tag}>`;
  }

  function renderSimulationCard(unit) {
    return `<button class="unit-card simulation-card" type="button" data-simulation="${unit.id}" style="--unit-color:${unit.color}">
      <div class="unit-top"><span class="unit-icon">${unit.icon}</span><span class="sim-card-label">LIVE MODEL</span></div>
      <h3><small>${unit.number}</small> ${unit.title}</h3>
      <p>${unit.description}</p>
      <div class="simulation-card-action"><span>条件を変えて試す</span><b>→</b></div>
    </button>`;
  }

  function openUnit(id, phase) {
    if (!window.SCIENCE_UNIT_DATA[id]) return;
    window.RikaFiveLabRouter?.leave?.();
    document.body.classList.remove("has-simulation");
    view = { page: "unit", unitId: id, phase: phase || view.phase || "knowledge", homeTab: "problems" };
    currentSelections = {};
    renderUnit();
    const phaseContent = document.getElementById("phase-content"); if (phaseContent) { const targetTop = phaseContent.getBoundingClientRect().top + window.scrollY - 82; window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" }); } else { window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  function openSimulation(id) {
    if (!window.SCIENCE_UNIT_DATA[id] || !window.RikaFiveLabRouter) return;
    window.RikaFiveLabRouter.leave?.();
    view = { page: "simulation", unitId: id, phase: "knowledge", homeTab: "simulation" };
    currentSelections = {};
    document.body.classList.add("has-simulation");
    app.innerHTML = `<section class="lab-loading"><span class="lab-loading-mark" aria-hidden="true">⌛</span><h1>LABを準備しています</h1><p>シミュレーションを読み込んでいます。</p></section>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#sim/${id}`);
    window.RikaFiveLabRouter.render(id, app, { onHome: () => renderHome("simulation") }).catch(error => {
      console.error(error);
      document.body.classList.remove("has-simulation");
      app.innerHTML = `<section class="empty-state lab-error"><h1>LABを読み込めませんでした</h1><p>画面を更新して、もう一度試してください。</p><button class="primary-button" type="button" data-sim-error-home>シミュレーション一覧へ</button></section>`;
      app.querySelector("[data-sim-error-home]")?.addEventListener("click", () => renderHome("simulation"));
    });
  }

  function renderUnit() {
    const unit = window.SCIENCE_UNIT_DATA[view.unitId];
    const progress = ProgressStore.getUnit(view.unitId);
    const percent = Math.round(unitPercent(view.unitId));
    app.innerHTML = `<div class="page">
      <section class="unit-head">
        <button class="back-button" type="button" data-action="home">← 単元選択へ</button>
        <div class="unit-title-row">
          <div><span class="eyebrow">UNIT ${unit.number || "--"} / ${unit.area || "SCIENCE"}</span><h1>${unit.title}</h1><p>${unit.subtitle}</p></div>
          <div class="unit-total"><strong>${percent}%</strong><span>ノート完成度</span></div>
        </div>
      </section>
      <nav class="phase-tabs" aria-label="学習段階">
        ${Object.entries(phaseMeta).map(([key, meta]) => `<button type="button" class="phase-tab ${view.phase === key ? "active" : ""} ${progress[key].done ? "done" : ""}" data-phase="${key}" aria-current="${view.phase === key ? "step" : "false"}"><span>${progress[key].done ? "✓" : meta.number}</span><span><strong>${meta.label}</strong><small>${meta.sub}</small></span></button>`).join("")}
      </nav>
      <section id="phase-content" class="phase-panel"></section>
    </div>`;

    app.querySelector('[data-action="home"]').addEventListener("click", () => renderHome("problems"));
    app.querySelectorAll("[data-phase]").forEach(button => button.addEventListener("click", () => {
      view.phase = button.dataset.phase;
      currentSelections = {};
      renderUnit();
    }));
    renderPhase();
    history.replaceState(null, "", `#${view.unitId}/${view.phase}`);
  }

  function phaseIntro(title, lead, current, total) {
    return `<div class="phase-intro"><div><span class="eyebrow">PHASE ${phaseMeta[view.phase].number}</span><h2>${title}</h2><p>${lead}</p></div><span class="step-count">${Math.min(current + 1, total)} / ${total}</span></div>`;
  }

  function renderPhase() {
    if (view.phase === "knowledge") renderKnowledge();
    if (view.phase === "preparation") renderPreparation();
    if (view.phase === "consideration") renderConsideration();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderKnowledge() {
    const phase = window.SCIENCE_UNIT_DATA[view.unitId].phases.knowledge;
    const progress = ProgressStore.getUnit(view.unitId).knowledge;
    const index = Math.min(progress.index, phase.pairs.length - 1);
    const item = phase.pairs[index];
    const target = document.getElementById("phase-content");
    target.innerHTML = phaseIntro(phase.title, phase.lead, index, phase.pairs.length) + `
      <div class="knowledge-pairs">
        <article class="knowledge-card"><h3>${item.left.title}</h3><ul>${item.left.items.map(x => `<li>${x}</li>`).join("")}</ul></article>
        <span class="versus">くらべる</span>
        <article class="knowledge-card contrast"><h3>${item.right.title}</h3><ul>${item.right.items.map(x => `<li>${x}</li>`).join("")}</ul></article>
      </div>
      <div class="caution"><span class="caution-mark">!</span><div><strong>混同ポイント</strong><br>${item.caution}</div></div>
      <div class="quick-check"><h3>${item.check.question}</h3><div class="choice-grid">${item.check.choices.map((choice, i) => `<button class="choice-button" type="button" data-choice="${i}">${choice}</button>`).join("")}</div><div class="feedback" id="feedback"></div></div>
      <div class="action-row"><button class="secondary-button" type="button" data-prev ${index === 0 ? "disabled" : ""}>前へ</button><button class="primary-button" type="button" data-next disabled>${index === phase.pairs.length - 1 ? "知識フェーズ完了" : "次のペアへ"}</button></div>`;

    target.querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => {
      const selected = Number(button.dataset.choice);
      const correct = selected === item.check.answer;
      target.querySelectorAll("[data-choice]").forEach((b, i) => {
        b.classList.toggle("selected", i === selected);
        b.classList.toggle("correct", i === item.check.answer);
        if (i === selected && !correct) b.classList.add("wrong");
        b.disabled = true;
      });
      const feedback = target.querySelector("#feedback");
      feedback.className = `feedback show ${correct ? "good" : "try"}`;
      feedback.innerHTML = `<strong>${correct ? "その通り！" : "ここを確認しよう"}</strong><br>${item.check.feedback}`;
      const wasCompleted = Object.prototype.hasOwnProperty.call(progress.answers, index);
      progress.answers[index] = correct;
      ProgressStore.save();
      window.ScienceGame?.award({ unitId: view.unitId, phase: "knowledge", itemId: item.id || index, correct, wasCompleted, unitComplete: false });
      target.querySelector("[data-next]").disabled = false;
    }));
    target.querySelector("[data-prev]").addEventListener("click", () => { progress.index = Math.max(0, index - 1); ProgressStore.save(); renderKnowledge(); });
    target.querySelector("[data-next]").addEventListener("click", () => {
      if (index < phase.pairs.length - 1) { progress.index = index + 1; ProgressStore.save(); renderKnowledge(); }
      else { progress.done = true; ProgressStore.save(); showToast("知識スタンプを獲得しました"); view.phase = "preparation"; renderUnit(); }
    });
  }

  function renderPreparation() {
    const phase = window.SCIENCE_UNIT_DATA[view.unitId].phases.preparation;
    const progress = ProgressStore.getUnit(view.unitId).preparation;
    const index = Math.min(progress.index, phase.scenarios.length - 1);
    const scenario = phase.scenarios[index];
    const target = document.getElementById("phase-content");
    currentSelections = {};
    const selector = scenario.mode === "select" ? `
      <div class="observation-rule"><b>${scenario.instruction || "必要な項目をすべて選ぼう"}</b><span>選び直すときは、もう一度タップ</span></div>
      <div class="condition-grid">${scenario.options.map(option => `<article class="condition-card observation-card" data-option-card="${option.id}"><h4>${option.name}</h4><p>${option.detail}</p><button class="select-option" type="button" data-option="${option.id}">選ぶ</button></article>`).join("")}</div>` : `
      <div class="condition-rule"><div class="rule-box"><b>変える条件</b><br>調べたいものを1つだけ</div><div class="rule-box control"><b>そろえる条件</b><br>結果に関わるほかの条件すべて</div></div>
      <div class="condition-grid">${scenario.conditions.map(condition => `<article class="condition-card" data-condition-card="${condition.id}"><h4>${condition.name}</h4><p>${condition.detail}</p><div class="condition-actions"><button type="button" data-condition="${condition.id}" data-role="change">変える</button><button type="button" data-condition="${condition.id}" data-role="control">そろえる</button></div></article>`).join("")}</div>`;
    target.innerHTML = phaseIntro(phase.title, phase.lead, index, phase.scenarios.length) + `
      <div class="question-banner"><small>調べたいこと</small><h3>${scenario.question}</h3></div>
      ${selector}
      <div class="feedback" id="feedback"></div>
      <div class="action-row"><button class="secondary-button" type="button" data-prev ${index === 0 ? "disabled" : ""}>前へ</button><button class="primary-button" type="button" data-check>実験方法を確かめる</button></div>`;

    target.querySelectorAll("[data-condition]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.condition;
      const role = button.dataset.role;
      currentSelections[id] = currentSelections[id] === role ? undefined : role;
      const card = target.querySelector(`[data-condition-card="${id}"]`);
      card.classList.toggle("is-change", currentSelections[id] === "change");
      card.classList.toggle("is-control", currentSelections[id] === "control");
      card.querySelectorAll("button").forEach(b => b.classList.toggle("active", currentSelections[id] === b.dataset.role));
    }));
    target.querySelectorAll("[data-option]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.option;
      currentSelections[id] = !currentSelections[id];
      const card = target.querySelector(`[data-option-card="${id}"]`);
      card.classList.toggle("is-selected", currentSelections[id]);
      button.classList.toggle("active", currentSelections[id]);
      button.textContent = currentSelections[id] ? "選択中 ✓" : "選ぶ";
    }));
    target.querySelector("[data-prev]").addEventListener("click", () => { progress.index = Math.max(0, index - 1); ProgressStore.save(); renderPreparation(); });
    target.querySelector("[data-check]").addEventListener("click", event => {
      const button = event.currentTarget;
      if (button.dataset.advance === "true") {
        if (index < phase.scenarios.length - 1) {
          progress.index = index + 1;
          ProgressStore.save();
          renderPreparation();
        } else {
          progress.done = true;
          ProgressStore.save();
          showToast(progress.perfectFirstTry ? "研究者レベル！ 一発正解ボーナス" : "実験準備スタンプを獲得しました");
          view.phase = "consideration";
          renderUnit();
        }
        return;
      }
      checkPreparation(scenario, index, phase.scenarios.length, button);
    });
  }

  function checkPreparation(scenario, index, total, checkButton) {
    if (scenario.mode === "select") return checkSelectionPreparation(scenario, index, total, checkButton);
    const progress = ProgressStore.getUnit(view.unitId).preparation;
    const changeSelected = Object.keys(currentSelections).filter(id => currentSelections[id] === "change");
    const controlSelected = Object.keys(currentSelections).filter(id => currentSelections[id] === "control");
    const wrongChange = changeSelected.filter(id => !scenario.change.includes(id));
    const missingChange = scenario.change.filter(id => !changeSelected.includes(id));
    const wrongControl = controlSelected.filter(id => !scenario.controls.includes(id));
    const missingControls = scenario.controls.filter(id => !controlSelected.includes(id));
    const correct = !wrongChange.length && !missingChange.length && !wrongControl.length && !missingControls.length;
    const feedback = document.getElementById("feedback");
    progress.attempts[scenario.id] = (progress.attempts[scenario.id] || 0) + 1;

    if (correct) {
      feedback.className = "feedback show good";
      feedback.innerHTML = `<strong>実験成立！</strong><br>${scenario.success}`;
      checkButton.textContent = index === total - 1 ? "実験準備フェーズ完了" : "次の実験へ";
      checkButton.dataset.advance = "true";
      document.querySelectorAll("[data-condition]").forEach(button => button.disabled = true);
      ProgressStore.save();
      window.ScienceGame?.award({ unitId: view.unitId, phase: "preparation", itemId: scenario.id, correct: true, wasCompleted: progress.attempts[scenario.id] > 1, unitComplete: false });
      return;
    }

    progress.perfectFirstTry = false;
    [...wrongChange, ...missingChange, ...wrongControl, ...missingControls].forEach(id => {
      const condition = scenario.conditions.find(c => c.id === id);
      if (condition) ProgressStore.addMistake(`${view.unitId}:${id}`, condition.name);
    });
    const reasons = [];
    if (changeSelected.length !== 1) reasons.push("変える条件は1つだけにしよう。");
    else if (wrongChange.length || missingChange.length) reasons.push("調べたいものを「変える条件」にしよう。");
    if (missingControls.length) reasons.push("そろえていない条件があると、何が原因か分からなくなるよ。");
    if (wrongControl.length) reasons.push("同じカードを別の役割にしていないか見直そう。");
    feedback.className = "feedback show try";
    feedback.innerHTML = `<strong>あと一歩。実験を見直そう</strong><br>${reasons.join(" ")}`;
    ProgressStore.save();
  }

  function checkSelectionPreparation(scenario, index, total, checkButton) {
    const progress = ProgressStore.getUnit(view.unitId).preparation;
    const selected = Object.keys(currentSelections).filter(id => currentSelections[id]);
    const missing = scenario.correct.filter(id => !selected.includes(id));
    const extra = selected.filter(id => !scenario.correct.includes(id));
    const correct = !missing.length && !extra.length;
    const feedback = document.getElementById("feedback");
    progress.attempts[scenario.id] = (progress.attempts[scenario.id] || 0) + 1;
    if (correct) {
      feedback.className = "feedback show good";
      feedback.innerHTML = `<strong>観察計画成立！</strong><br>${scenario.success}`;
      checkButton.textContent = index === total - 1 ? "観察準備フェーズ完了" : "次の計画へ";
      checkButton.dataset.advance = "true";
      document.querySelectorAll("[data-option]").forEach(button => button.disabled = true);
      ProgressStore.save();
      window.ScienceGame?.award({ unitId: view.unitId, phase: "preparation", itemId: scenario.id, correct: true, wasCompleted: progress.attempts[scenario.id] > 1, unitComplete: false });
      return;
    }
    progress.perfectFirstTry = false;
    [...missing, ...extra].forEach(id => {
      const option = scenario.options.find(item => item.id === id);
      if (option) ProgressStore.addMistake(`${view.unitId}:${id}`, option.name);
    });
    const reasons = [];
    if (missing.length) reasons.push("目的を調べるために必要な項目が、まだあります。");
    if (extra.length) reasons.push("その項目は、今回の目的に直接必要か考え直そう。");
    feedback.className = "feedback show try";
    feedback.innerHTML = `<strong>観察の目的に戻ろう</strong><br>${reasons.join(" ")}`;
    ProgressStore.save();
  }

  function renderConsideration() {
    const phase = window.SCIENCE_UNIT_DATA[view.unitId].phases.consideration;
    const progress = ProgressStore.getUnit(view.unitId).consideration;
    if (progress.done) return renderCompletion();
    const index = Math.min(progress.index, phase.questions.length - 1);
    const item = phase.questions[index];
    const target = document.getElementById("phase-content");
    target.innerHTML = phaseIntro(phase.title, phase.lead, index, phase.questions.length) + `
      <article><span class="claim-label">${item.label || "実験結果"}</span><h3>${item.prompt}</h3>${renderVisual(item.visual)}<div class="choice-grid">${item.choices.map((choice, i) => `<button class="choice-button" type="button" data-choice="${i}">${choice}</button>`).join("")}</div><div class="feedback" id="feedback"></div></article>
      <div class="action-row"><button class="secondary-button" type="button" data-prev ${index === 0 ? "disabled" : ""}>前へ</button><button class="primary-button" type="button" data-next disabled>${index === phase.questions.length - 1 ? "考察をまとめる" : "次の結果へ"}</button></div>`;
    target.querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => {
      const selected = Number(button.dataset.choice);
      const correct = selected === item.answer;
      target.querySelectorAll("[data-choice]").forEach((b, i) => {
        b.classList.toggle("correct", i === item.answer);
        if (i === selected && !correct) b.classList.add("wrong");
        b.disabled = true;
      });
      const feedback = target.querySelector("#feedback");
      feedback.className = `feedback show ${correct ? "good" : "try"}`;
      feedback.innerHTML = `<strong>${correct ? "根拠に合っています" : "結果より広く言いすぎていないかな？"}</strong><br>${item.feedback}`;
      const wasCompleted = Object.prototype.hasOwnProperty.call(progress.answers, item.id);
      progress.answers[item.id] = correct;
      ProgressStore.save();
      window.ScienceGame?.award({ unitId: view.unitId, phase: "consideration", itemId: item.id, correct, wasCompleted, unitComplete: false });
      target.querySelector("[data-next]").disabled = false;
    }));
    target.querySelector("[data-prev]").addEventListener("click", () => { progress.index = Math.max(0, index - 1); ProgressStore.save(); renderConsideration(); });
    target.querySelector("[data-next]").addEventListener("click", () => {
      if (index < phase.questions.length - 1) { progress.index = index + 1; ProgressStore.save(); renderConsideration(); }
      else { progress.done = true; ProgressStore.getUnit(view.unitId).cleared = true; ProgressStore.save(); window.ScienceGame?.award({ unitId: view.unitId, phase: "consideration", itemId: "complete", correct: true, wasCompleted: true, unitComplete: true }); renderCompletion(); showToast(`${window.SCIENCE_UNIT_DATA[view.unitId].title}単元クリア！`); }
    });
  }

  function renderVisual(visual) {
    if (!visual) return "";
    if (visual.type === "table") return `<div class="result-visual"><table class="data-table"><thead><tr>${visual.headers.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>${visual.rows.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    if (visual.type === "bars") return `<div class="result-visual"><div class="bar-chart" style="--bars:${visual.bars.length}" role="img" aria-label="${visual.bars.map(b => `${b.label} ${b.value}${visual.unit}`).join("、")}">${visual.bars.map(b => `<div class="bar" style="--h:${b.value / visual.max * 100}%"><b>${b.value}${visual.unit}</b><span>${b.label}</span></div>`).join("")}</div><p class="evidence-note">※ 初めの大きさ・水・肥料・育てた日数は同じ</p></div>`;
    if (visual.type === "cards") return `<div class="result-visual visual-cards">${visual.items.map((item, i) => `<span><b>${i + 1}</b>${item}</span>`).join("")}</div>`;
    if (visual.type === "timeline") return `<div class="result-visual timeline-visual">${visual.items.map((item, i) => `<span>${item}</span>${i < visual.items.length - 1 ? '<b aria-hidden="true">→</b>' : ""}`).join("")}</div>`;
    if (visual.type === "river") return `<div class="result-visual river-visual" role="img" aria-label="川のカーブ。Aが外側、Bが内側"><svg viewBox="0 0 520 220" aria-hidden="true"><path class="river-bank" d="M18 45C170 4 153 186 306 158c73-13 107-86 197-56"/><path class="river-bank" d="M18 112c98-25 116 122 298 102 97-11 121-65 187-48"/><path class="flow-line" d="M40 78c105-7 126 92 273 99 79 4 111-45 170-43"/><path class="arrow-head" d="m467 124 18 10-18 11"/></svg><span class="river-label outer">${visual.outer}</span><span class="river-label inner">${visual.inner}</span></div>`;
    return "";
  }

  function renderCompletion() {
    const progress = ProgressStore.getUnit(view.unitId);
    const unit = window.SCIENCE_UNIT_DATA[view.unitId];
    const total = unit.phases.consideration.questions.length;
    const answers = Object.values(progress.consideration.answers);
    const score = answers.filter(Boolean).length;
    const target = document.getElementById("phase-content");
    target.innerHTML = `<div class="completion"><div class="completion-mark">✓</div><span class="eyebrow">UNIT COMPLETE</span><h3>${unit.title} 研究ノート完成！</h3><p>${unit.completion || "観察や実験の結果を根拠に、条件と結果の関係を考えられました。"}</p><p><strong>考察の初回正解：${score} / ${total}</strong>${progress.preparation.perfectFirstTry ? "　・　研究者レベル達成" : ""}</p><div class="action-row"><button class="secondary-button" type="button" data-retry>考察をもう一度</button><button class="primary-button" type="button" data-home>単元選択へ</button></div></div>`;
    target.querySelector("[data-home]").addEventListener("click", () => renderHome("problems"));
    target.querySelector("[data-retry]").addEventListener("click", () => { progress.consideration.index = 0; progress.consideration.done = false; progress.consideration.answers = {}; ProgressStore.save(); renderConsideration(); });
  }

  function renderNotebook() {
    const mistakes = Object.values(ProgressStore.getAll().mistakes).sort((a, b) => b.count - a.count);
    notebookContent.innerHTML = `<div class="stamp-grid">${window.SCIENCE_UNITS.map(unit => {
      const collected = unit.available && ProgressStore.getUnit(unit.id).cleared;
      return `<div class="stamp ${collected ? "collected" : ""}"><span class="stamp-mark">${collected ? "✓" : unit.number}</span><strong>${unit.shortTitle}</strong><small>${collected ? "研究完了" : unit.available ? "研究中" : "これから"}</small></div>`;
    }).join("")}</div><div class="mistake-box"><h3>条件カードのふりかえり</h3>${mistakes.length ? `<div class="mistake-tags">${mistakes.slice(0, 6).map(m => `<span class="mistake-tag">${escapeHtml(m.name)} × ${m.count}</span>`).join("")}</div><p class="evidence-note">回数が多いカードほど、次の実験で「変える／そろえる」を意識しよう。</p>` : `<p class="evidence-note">まだ記録はありません。実験準備に挑戦すると、見直しポイントがたまります。</p>`}</div><button class="reset-button" type="button" data-reset>この端末の学習記録を消す</button>`;
    notebookContent.querySelector("[data-reset]").addEventListener("click", () => {
      if (confirm("学習記録をすべて消しますか？ この操作は元に戻せません。")) { ProgressStore.reset(); notebook.close(); renderHome("problems"); showToast("学習記録を消しました"); }
    });
  }

  document.getElementById("home-button").addEventListener("click", renderHome);
  document.getElementById("discovery-button").addEventListener("click", () => { window.RikaFiveLabRouter?.leave?.(); document.body.classList.remove("has-simulation"); app.innerHTML = window.ScienceGame?.catalog() || ""; app.querySelector("[data-home]")?.addEventListener("click", renderHome); });
  document.getElementById("notebook-button").addEventListener("click", () => { renderNotebook(); notebook.showModal(); });
  notebook.querySelector(".dialog-close").addEventListener("click", () => notebook.close());
  notebook.addEventListener("click", event => { if (event.target === notebook) notebook.close(); });

  const hash = location.hash.replace(/^#/, "");
  const [first, second] = hash.split("/");
  if (first === "sim" && window.SCIENCE_UNIT_DATA[second]) openSimulation(second);
  else if (window.SCIENCE_UNIT_DATA[first] && phaseMeta[second]) openUnit(first, second);
  else renderHome(first === "home" && second === "problems" ? "problems" : "simulation");
})();
