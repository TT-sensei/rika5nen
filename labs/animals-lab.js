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
    ui.panel.innerHTML = "";
    const time = core.section(ui.panel, "時間を進める", "卵の中の変化を日ごとに観察");
    core.range(time, { label: "経過日数", min: 0, max: 10, value: state.days, format: value => `${value}日`, onInput: value => { state.days = value; paint(); } });
    const observe = core.section(ui.panel, "観察倍率");
    core.options(observe, { label: "倍率", values: [{ id: "1", label: "1倍" }, { id: "2", label: "2倍" }, { id: "4", label: "4倍" }], value: state.magnification, onChange: value => { state.magnification = Number(value); paint(); } });
    core.presets(ui.panel, [{ id: "egg", label: "受精直後" }, { id: "eye", label: "目が見える" }, { id: "fry", label: "稚魚" }], id => { state.days = id === "egg" ? 0 : id === "eye" ? 4 : 9; paint(); });
    core.action(ui.actions, "1日進める", () => { state.days = Math.min(10, state.days + 1); paint(); }, "primary-button");
    core.action(ui.actions, "最初に戻す", () => { Object.assign(state, DEFAULT); paint(); }, "secondary-button");
    ui.note.textContent = "卵の中の変化を、学習内容に合わせて「細胞が増える → 体ができる → ふ化 → 稚魚」の順で表しています。";
    paint();
    return () => ui.destroy();
  }
  window.RikaFiveSimulations.animals = { mount };
})();
