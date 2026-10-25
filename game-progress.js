(function () {
  const storageKey = "it-lab-game-results";

  function readResults() {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === null) return {};

    const results = JSON.parse(saved);
    if (!results || typeof results !== "object" || Array.isArray(results)) {
      throw new Error("Збережені результати IT LAB мають неправильний формат.");
    }
    return results;
  }

  function getSummary() {
    const results = readResults();
    const entries = Object.values(results);

    return {
      xp: entries.reduce((total, result) => total + result.xp, 0),
      completedGames: entries.length
    };
  }

  window.ITLabProgress = {
    complete(gameId, xp) {
      if (typeof gameId !== "string" || !gameId.trim() || !Number.isFinite(xp) || xp < 0) {
        throw new TypeError("Для збереження результату потрібні назва гри та невід’ємний XP.");
      }

      const results = readResults();
      const previous = results[gameId];
      results[gameId] = {
        xp: Math.max(previous && Number.isFinite(previous.xp) ? previous.xp : 0, Math.round(xp)),
        completedAt: new Date().toISOString()
      };
      window.localStorage.setItem(storageKey, JSON.stringify(results));
      return getSummary();
    },

    getSummary
  };
})();
