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
    const entries = Object.values(results).filter(
      result => result && typeof result === "object"
    );

    return {
      xp: entries.reduce(
        (total, result) => total + (Number.isFinite(result.xp) ? result.xp : 0),
        0
      ),
      playedGames: entries.length,
      completedGames: entries.filter(result => typeof result.completedAt === "string").length
    };
  }

  function validateResult(gameId, xp) {
    if (typeof gameId !== "string" || !gameId.trim() || !Number.isFinite(xp) || xp < 0) {
      throw new TypeError("Для збереження результату потрібні назва гри та невід’ємний XP.");
    }
  }

  function record(gameId, xp) {
    validateResult(gameId, xp);

    const results = readResults();
    const previous = results[gameId];
    const now = new Date().toISOString();
    results[gameId] = {
      ...(previous && typeof previous === "object" ? previous : {}),
      xp: Math.max(previous && Number.isFinite(previous.xp) ? previous.xp : 0, Math.round(xp)),
      playedAt: previous && typeof previous.playedAt === "string"
        ? previous.playedAt
        : previous && typeof previous.completedAt === "string"
          ? previous.completedAt
          : now
    };
    window.localStorage.setItem(storageKey, JSON.stringify(results));
    return getSummary();
  }

  window.ITLabProgress = {
    start(gameId) {
      return record(gameId, 0);
    },

    record,

    complete(gameId, xp) {
      validateResult(gameId, xp);
      record(gameId, xp);
      const results = readResults();
      results[gameId] = {
        ...results[gameId],
        completedAt: new Date().toISOString()
      };
      window.localStorage.setItem(storageKey, JSON.stringify(results));
      return getSummary();
    },

    getSummary
  };

  const gameId = document.body.getAttribute("data-game-id");
  if (gameId) window.ITLabProgress.start(gameId);
})();
