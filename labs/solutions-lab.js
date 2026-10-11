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
    // 経過0ではまだ物質がとけていない状態から始める。
    // かき混ぜは、とける速さだけに影響し、溶解度(max)は変えない。
    const speed = (state.temperature / 80 + (state.stirred ? .65 : .25)) * (state.time / 10);
    const dissolved = Math.min(state.amount, max, Math.round(max * Math.min(1, speed) * 10) / 10);
    return { max, dissolved, leftover: Math.max(0, Math.round((state.amount - dissolved) * 10) / 10), progress: max ? dissolved / Math.min(state.amount, max) : 0 };
  }

  function solutionSvg(state, model) {
    const dissolvedCount = Math.round(model.progress * 22);
    const dissolvedParticles = Array.from({ length: 22 }, (_, i) => {
      if (i >= dissolvedCount) return "";
      const x = 300 + (i * 37) % 160;
      const y = 174 + (i * 23) % 75;
      return `<circle class="solution-dot dissolved" cx="${x}" cy="${y}" r="4" style="--delay:${(i % 7) * -.28}s"/>`;
    }).join("");
    const leftoverCount = Math.min(16, Math.round(model.leftover / 3));
    const leftoverParticles = Array.from({ length: leftoverCount }, (_, i) => {
      const x = 315 + (i * 29) % 130;
      const y = 277 - Math.floor(i / 7) * 7 - (i % 3) * 2;
      return `<circle class="solution-dot leftover" cx="${x}" cy="${y}" r="5"/>`;
    }).join("");
    const particles = dissolvedParticles + leftoverParticles;
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
        { label: state.evaporated ? "蒸発前にとけた量" : "とけた量", value: `${model.dissolved}g` },
        { label: state.evaporated ? "蒸発前のとけ残り" : "とけ残り", value: `${model.leftover}g` },
        { label: state.evaporated ? "蒸発前の溶解度の目安" : "最終的にとける量", value: `${model.max}g`, detail: `${substance}・${state.water}mL` },
        { label: state.evaporated ? "蒸発前の状態" : "状態", value: model.leftover > 0 && model.dissolved >= model.max ? "飽和" : model.leftover > 0 ? "とけている途中" : "全部とけた" },
        { label: state.evaporated ? "蒸発後に残る物質" : "水と物質の合計", value: `${state.evaporated ? state.amount : state.water + state.amount}g` }
      ], message, note: state.evaporated ? `蒸発後に残る物質：${state.amount}g` : `時間：${state.time}/10　／　温度：${state.temperature}℃　／　かき混ぜ：${state.stirred ? "する（とける速さに影響）" : "しない"}　／　溶解度はかき混ぜでは変わらない` });
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
    core.action(ui.actions, "時間を進める", () => { state.time = Math.min(10, state.time + 2); timeRange.set(state.time); paint(); }, "primary-button");
    evaporateButton = core.action(ui.actions, "水を蒸発させる", () => { state.evaporated = !state.evaporated; paint(); }, "secondary-button");
    core.action(ui.actions, "最初にもどす", () => { Object.assign(state, DEFAULT); buildControls(); paint(); }, "secondary-button");
    ui.note.textContent = "数値は水の量・温度・物質による違いを比べるための模型上の目安です。実際の溶解度や溶ける速さを正確に再現した値ではありません。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.solutions = { mount };
})();
