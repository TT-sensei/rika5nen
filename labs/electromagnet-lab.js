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
