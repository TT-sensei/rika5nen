(function () {
  const app = document.getElementById("app");
  const notebook = document.getElementById("notebook-dialog");
  const notebookContent = document.getElementById("notebook-content");
  const toast = document.getElementById("toast");
  let view = { page: "home", unitId: null, phase: "knowledge" };
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

  function renderHome() {
    view = { page: "home", unitId: null, phase: "knowledge" };
    app.innerHTML = `
      <div class="page">
        <section class="hero">
          <div>
            <span class="eyebrow">SCIENCE LABORATORY / GRADE 5</span>
            <h1>比べるから、わかる。</h1>
            <p>理科の知識を使って実験を組み立て、結果から言えることを考えます。6つの単元を進めて、自分だけの実験ノートを完成させよう。</p>
            <div class="phase-strip" aria-label="3つの学習段階">
              <span class="phase-chip"><b>1</b> 知識を整理</span>
              <span class="phase-chip"><b>2</b> 実験を準備</span>
              <span class="phase-chip"><b>3</b> 結果を考察</span>
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="orbit"></div>
            <div class="hero-flask"><svg viewBox="0 0 160 180"><path d="M58 12h44M65 12v55l-42 75c-6 12 2 26 16 26h82c14 0 22-14 16-26L95 67V12"/><path d="M38 120h84"/><circle cx="65" cy="108" r="5"/><circle cx="96" cy="138" r="7"/><path d="M61 59h38"/></svg></div>
          </div>
        </section>
        <div class="section-heading">
          <div><span class="eyebrow">SELECT A UNIT</span><h2>研究する単元を選ぼう</h2></div>
          <p>記録はこの端末に自動で保存されます</p>
        </div>
        ${window.ScienceGame ? window.ScienceGame.panel() : ""}
        <section class="unit-grid" aria-label="単元一覧">
          ${window.SCIENCE_UNITS.map(renderUnitCard).join("")}
        </section>
      </div>`;

    app.querySelectorAll("button.unit-card").forEach(button => {
      button.addEventListener("click", () => openUnit(button.dataset.unit));
    });
    history.replaceState(null, "", "#home");
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
        <div class="progress-label"><span>実験ノート</span><span>${Math.round(percent)}%</span></div>
      </div>
    </${tag}>`;
  }

  function openUnit(id, phase) {
    if (!window.SCIENCE_UNIT_DATA[id]) return;
    view = { page: "unit", unitId: id, phase: phase || view.phase || "knowledge" };
    currentSelections = {};
    renderUnit();
    const phaseContent = document.getElementById("phase-content"); if (phaseContent) { const targetTop = phaseContent.getBoundingClientRect().top + window.scrollY - 82; window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" }); } else { window.scrollTo({ top: 0, behavior: "smooth" }); }
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

    app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
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
    target.querySelector("[data-home]").addEventListener("click", renderHome);
    target.querySelector("[data-retry]").addEventListener("click", () => { progress.consideration.index = 0; progress.consideration.done = false; progress.consideration.answers = {}; ProgressStore.save(); renderConsideration(); });
  }

  function renderNotebook() {
    const mistakes = Object.values(ProgressStore.getAll().mistakes).sort((a, b) => b.count - a.count);
    notebookContent.innerHTML = `<div class="stamp-grid">${window.SCIENCE_UNITS.map(unit => {
      const collected = unit.available && ProgressStore.getUnit(unit.id).cleared;
      return `<div class="stamp ${collected ? "collected" : ""}"><span class="stamp-mark">${collected ? "✓" : unit.number}</span><strong>${unit.shortTitle}</strong><small>${collected ? "研究完了" : unit.available ? "研究中" : "これから"}</small></div>`;
    }).join("")}</div><div class="mistake-box"><h3>条件カードのふりかえり</h3>${mistakes.length ? `<div class="mistake-tags">${mistakes.slice(0, 6).map(m => `<span class="mistake-tag">${escapeHtml(m.name)} × ${m.count}</span>`).join("")}</div><p class="evidence-note">回数が多いカードほど、次の実験で「変える／そろえる」を意識しよう。</p>` : `<p class="evidence-note">まだ記録はありません。実験準備に挑戦すると、見直しポイントがたまります。</p>`}</div><button class="reset-button" type="button" data-reset>この端末の学習記録を消す</button>`;
    notebookContent.querySelector("[data-reset]").addEventListener("click", () => {
      if (confirm("学習記録をすべて消しますか？ この操作は元に戻せません。")) { ProgressStore.reset(); notebook.close(); renderHome(); showToast("学習記録を消しました"); }
    });
  }

  document.getElementById("home-button").addEventListener("click", renderHome);
  document.getElementById("discovery-button").addEventListener("click", () => { app.innerHTML = window.ScienceGame?.catalog() || ""; app.querySelector("[data-home]")?.addEventListener("click", renderHome); });
  document.getElementById("notebook-button").addEventListener("click", () => { renderNotebook(); notebook.showModal(); });
  notebook.querySelector(".dialog-close").addEventListener("click", () => notebook.close());
  notebook.addEventListener("click", event => { if (event.target === notebook) notebook.close(); });

  const hash = location.hash.replace(/^#/, "");
  const [unitId, phase] = hash.split("/");
  if (window.SCIENCE_UNIT_DATA[unitId] && phaseMeta[phase]) openUnit(unitId, phase);
  else renderHome();
})();
