// 既存の番号ベースの学習履歴を壊さず、各フェーズに復習問題を追加する。
(() => {
  const data = window.SCIENCE_UNIT_DATA || {};
  Object.values(data).forEach(unit => {
    const phases = unit.phases;
    const add = (list, suffix, label) => {
      if (!list.length || list.some(item => item.id && item.id.endsWith(suffix))) return;
      const copy = JSON.parse(JSON.stringify(list[0]));
      copy.id = `${copy.id || label}${suffix}`;
      if (copy.check) copy.check.question = `復習：${copy.check.question}`;
      if (copy.question) copy.question = `復習：${copy.question}`;
      if (copy.title) copy.title = `復習：${copy.title}`;
      list.push(copy);
    };
    add(phases.knowledge.pairs, "-review", "knowledge");
    add(phases.preparation.scenarios, "-review", "preparation");
    add(phases.consideration.questions, "-review", "consideration");
  });
})();
