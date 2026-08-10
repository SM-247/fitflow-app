function getMovementCounts(history) {
  const counts = {};
  history.forEach(workout => {
    workout.exercises.forEach(ex => {
      const pattern = ex.movement_pattern;
      counts[pattern] = (counts[pattern] || 0) + 1;
    });
  });
  return counts;
}

function getLeastUsedMovement(counts) {
  const patterns = ['push', 'pull', 'squat', 'hinge', 'lunge'];
  let least = patterns[0];
  let min = counts[least] || 0;

  patterns.forEach(pattern => {
    const value = counts[pattern] || 0;
    if (value < min) {
      min = value;
      least = pattern;
    }
  });

  return least;
}

function prioritizeUnderusedMovement(exercises, history) {
  if (!history.length) return exercises;
  const counts = getMovementCounts(history);
  const target = getLeastUsedMovement(counts);

  return exercises.sort((a, b) => {
    if (a.movement_pattern === target) return -1;
    if (b.movement_pattern === target) return 1;
    return 0;
  });
}

module.exports = {
  getMovementCounts,
  getLeastUsedMovement,
  prioritizeUnderusedMovement
};