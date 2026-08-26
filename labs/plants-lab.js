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
