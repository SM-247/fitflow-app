const { calculateRollingFatigue } = require('./fatigueEngine');

function generateWorkout({
  exerciseList,
  location,
  energy,
  soreness,
  timeAvailable,
  recentWorkouts = []
}) {
  let available = exerciseList.filter(
    ex => ex.location === location || ex.location === 'both'
  );

  if (energy <= 2) {
    available = available.filter(ex => ex.fatigue_score < 4);
  }

  const rollingFatigue = calculateRollingFatigue(recentWorkouts, 3);
  if (rollingFatigue > 30) {
    available = available.filter(ex => ex.fatigue_score <= 2);
  }

  const recentPattern = recentWorkouts[0]?.movement_pattern;

  const compounds = available.filter(
    ex => ex.is_compound && ex.category === 'strength' && ex.movement_pattern !== recentPattern
  );
  const accessories = available.filter(
    ex => !ex.is_compound && ex.category === 'strength'
  );
  const finishers = available.filter(
    ex => ex.category === 'core' || ex.category === 'mobility'
  );

  const selected = [];

  if (compounds.length > 0) {
    selected.push(compounds[Math.floor(Math.random() * compounds.length)]);
  }

  const shuffledAccessories = [...accessories].sort(() => 0.5 - Math.random());
  selected.push(...shuffledAccessories.slice(0, 2));

  if (finishers.length > 0) {
    selected.push(finishers[Math.floor(Math.random() * finishers.length)]);
  }

  const fatigueCaps = { 5: 14, 4: 12, 3: 10, 2: 7, 1: 5 };
  const fatigueCap = fatigueCaps[energy] || 5;

  let totalFatigue = selected.reduce((sum, ex) => sum + ex.fatigue_score, 0);

  if (soreness >= 4 && selected.length > 1) {
    const removable = selected.slice(1);
    const highest = removable.reduce((max, ex) =>
      ex.fatigue_score > max.fatigue_score ? ex : max
    );
    selected.splice(selected.indexOf(highest), 1);
  }

  totalFatigue = selected.reduce((sum, ex) => sum + ex.fatigue_score, 0);

  while (totalFatigue > fatigueCap && selected.length > 2) {
    const last = selected[selected.length - 1];
    totalFatigue -= last.fatigue_score;
    selected.pop();
  }

  let totalTime = selected.reduce((sum, ex) => sum + ex.estimated_time_minutes, 0);

  const remaining = available.filter(ex => !selected.some(sel => sel.id === ex.id));
  const sortedRemaining = remaining.sort((a, b) => {
    if (a.is_compound && !b.is_compound) return -1;
    if (!a.is_compound && b.is_compound) return 1;
    return a.fatigue_score - b.fatigue_score;
  });

  for (const ex of sortedRemaining) {
    if (
      totalTime + ex.estimated_time_minutes <= timeAvailable &&
      totalFatigue + ex.fatigue_score <= fatigueCap
    ) {
      selected.push(ex);
      totalTime += ex.estimated_time_minutes;
      totalFatigue += ex.fatigue_score;
    }
  }

  return selected;
}

module.exports = { generateWorkout };