function calculateTotalFatigue(workout) {
  return workout.reduce((sum, ex) => sum + ex.fatigue_score, 0);
}

function getFatigueCap(energy) {
  const fatigueCaps = { 5: 14, 4: 12, 3: 10, 2: 7, 1: 5 };
  return fatigueCaps[energy] || 5;
}

function applyFatigueCap(workout, energy) {
  const cap = getFatigueCap(energy);
  let total = calculateTotalFatigue(workout);
  let adjusted = [...workout];

  while (total > cap && adjusted.length > 1) {
    const removable = adjusted.slice(1);
    const highest = removable.reduce((max, ex) =>
      ex.fatigue_score > max.fatigue_score ? ex : max
    );
    adjusted.splice(adjusted.indexOf(highest), 1);
    total = calculateTotalFatigue(adjusted);
  }

  return adjusted;
}

function calculateRollingFatigue(history, days = 3) {
  const recent = history.slice(-days);
  return recent.reduce((sum, day) => sum + day.totalFatigue, 0);
}

function shouldDeload(history) {
  const rolling = calculateRollingFatigue(history, 3);
  return rolling > 30;
}

module.exports = {
  calculateTotalFatigue,
  getFatigueCap,
  applyFatigueCap,
  calculateRollingFatigue,
  shouldDeload
};