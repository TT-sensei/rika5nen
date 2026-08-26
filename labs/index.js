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
