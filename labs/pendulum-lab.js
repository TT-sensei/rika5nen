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
