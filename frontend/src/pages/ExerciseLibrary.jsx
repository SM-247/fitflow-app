import { useEffect, useState } from 'react';
import { API_URL } from '../api';
const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      const response = await fetch(`${API_URL}/api/exercises`);
      const json = await response.json();
      if (response.ok) setExercises(json);
    };
    fetchExercises();
  }, []);

  // derive filter option lists from actual data, so they're always accurate
  const muscles = [...new Set(exercises.map((ex) => ex.primary_muscle))].sort();
  const categories = [...new Set(exercises.map((ex) => ex.category))].sort();
  const equipmentTypes = [...new Set(exercises.map((ex) => ex.equipment))].sort();

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !muscleFilter || ex.primary_muscle === muscleFilter;
    const matchesCategory = !categoryFilter || ex.category === categoryFilter;
    const matchesEquipment = !equipmentFilter || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesCategory && matchesEquipment;
  });

  const clearFilters = () => {
    setSearch('');
    setMuscleFilter('');
    setCategoryFilter('');
    setEquipmentFilter('');
  };

  return (
    <div className="exercise-library">
      <h2>Exercise Library</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}>
          <option value="">All Muscles</option>
          {muscles.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)}>
          <option value="">All Equipment</option>
          {equipmentTypes.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
        </select>

        {(search || muscleFilter || categoryFilter || equipmentFilter) && (
          <button onClick={clearFilters} className="clear-btn">Clear filters</button>
        )}
      </div>

      <p className="result-count">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''}</p>

      <div className="exercise-grid">
        {filtered.map((ex) => (
          <div key={ex.id} className="exercise-card">
            <h4>{ex.name}</h4>
            <p><strong>Muscle:</strong> {ex.primary_muscle}</p>
            <p><strong>Category:</strong> {ex.category}</p>
            <p><strong>Equipment:</strong> {ex.equipment}</p>
            <p><strong>Difficulty:</strong> {ex.difficulty}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="no-results">No exercises match your filters.</p>
      )}
    </div>
  );
};

export default ExerciseLibrary;