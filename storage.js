(function () {
  const KEY = "science-lab-5-progress-v1";
  const empty = () => ({ units: {}, mistakes: {}, updatedAt: null });

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      return parsed && typeof parsed === "object" ? { ...empty(), ...parsed } : empty();
    } catch (_) {
      return empty();
    }
  }

  let data = load();

  function unit(id) {
    data.units[id] = data.units[id] || {
      knowledge: { index: 0, answers: {}, done: false },
      preparation: { index: 0, attempts: {}, done: false, perfectFirstTry: true },
      consideration: { index: 0, answers: {}, done: false },
      cleared: false
    };
    return data.units[id];
  }

  function save() {
    data.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
  }

  window.ProgressStore = {
    getAll: () => data,
    getUnit: unit,
    save,
    addMistake(conditionId, name) {
      data.mistakes[conditionId] = data.mistakes[conditionId] || { name, count: 0 };
      data.mistakes[conditionId].count += 1;
      save();
    },
    reset() {
      data = empty();
      try { localStorage.removeItem(KEY); } catch (_) {}
    }
  };
})();
