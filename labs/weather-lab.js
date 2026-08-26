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
