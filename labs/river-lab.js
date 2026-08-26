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
