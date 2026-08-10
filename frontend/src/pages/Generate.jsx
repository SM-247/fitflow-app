import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { API_URL } from '../api';
const toLocalDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Generate = () => {
  const { user } = useAuthContext();
  const { workouts, dispatch } = useWorkoutsContext();
  const navigate = useNavigate();

  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [timeAvailable, setTimeAvailable] = useState(45);
  const [location, setLocation] = useState('gym');

  const [suggestion, setSuggestion] = useState(null);
  const [rollingFatigue, setRollingFatigue] = useState(null);
  const [logInputs, setLogInputs] = useState({});
  const [error, setError] = useState(null);
  const [logError, setLogError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    if (!user) {
      setSuggestion(null);
      setRollingFatigue(null);
      setLogInputs({});
      setError(null);
      setLogError(null);
      navigate('/login');
    }
  }, [user, navigate]);

  // fetch workouts independently so "already logged today" works
  // even if this page is visited before Home
  useEffect(() => {
    const fetchWorkouts = async () => {
      const response = await fetch(`${API_URL}/api/workouts`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const json = await response.json();
      if (response.ok) {
        dispatch({ type: 'SET_WORKOUTS', payload: json });
      }
    };
    if (user) fetchWorkouts();
  }, [dispatch, user]);

  // set of exercise names already logged today, derived from real saved history
  const todayKey = toLocalDateKey(new Date());
  const loggedTodayTitles = new Set(
    (workouts || [])
      .filter((w) => toLocalDateKey(w.createdAt) === todayKey)
      .map((w) => w.title)
  );

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    setJustLogged(false);

    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ energy, soreness, timeAvailable, location })
    });
    const json = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setError(json.error || 'Something went wrong');
    } else {
      setSuggestion(json.suggestion);
      setRollingFatigue(json.rollingFatigue);

      const initialInputs = {};
      json.suggestion.forEach((ex) => {
        initialInputs[ex.id] = {
          load: ex.intensity_type === 'load_based' ? '' : 0,
          reps: parseInt(ex.recommended_reps_range) || 10,
          sets: ex.recommended_sets || 3
        };
      });
      setLogInputs(initialInputs);
    }
  };

  const updateInput = (exerciseId, field, value) => {
    setLogInputs((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value }
    }));
  };

  const handleLogExercise = async (exercise) => {
    setLogError(null);
    const inputs = logInputs[exercise.id];

    const isLoadBased = exercise.intensity_type === 'load_based';

    if (isLoadBased && (inputs.load === '' || inputs.load === undefined)) {
      setLogError(`Please enter a weight for ${exercise.name}`);
      return;
    }

    const workout = {
      title: exercise.name,
      load: isLoadBased ? Number(inputs.load) : 0,
      reps: Number(inputs.reps),
      sets: Number(inputs.sets)
    };

    const response = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      body: JSON.stringify(workout),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });
    const json = await response.json();

    if (response.ok) {
      dispatch({ type: 'CREATE_WORKOUT', payload: json });
      setJustLogged(true);
    } else {
      setLogError(json.error || 'Failed to log workout');
    }
  };

  return (
    <div className="generate">
      <h2>Generate a Workout</h2>
      <p className="page-hint">
        This isn't a fixed weekly plan — tell us how you're feeling today, and
        we'll balance exercise rotation and fatigue automatically each time you generate.
      </p>

      <form onSubmit={handleGenerate} className="checkin-form">
        <label>Energy (1–5):</label>
        <input type="number" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
        <p className="field-hint">1 = exhausted, 5 = fully recovered</p>

        <label>Soreness (1–5):</label>
        <input type="number" min="1" max="5" value={soreness} onChange={(e) => setSoreness(Number(e.target.value))} />
        <p className="field-hint">1 = no soreness, 5 = very sore</p>

        <label>Time Available (minutes):</label>
        <input type="number" value={timeAvailable} onChange={(e) => setTimeAvailable(Number(e.target.value))} />

        <label>Location:</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="gym">Gym</option>
          <option value="home">Home</option>
          <option value="both">Either</option>
        </select>

        <button disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Workout'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>

      {suggestion && (
        <div className="suggestion-results">
          <h3>Suggested Session</h3>
          <p>Rolling fatigue (last 3 sessions): {rollingFatigue}</p>
          {logError && <div className="error">{logError}</div>}
          {justLogged && (
            <div className="success-banner">
              Logged! <Link to="/dashboard">View it on your Dashboard</Link> or <Link to="/calendar">Calendar</Link>.
            </div>
          )}

          <div className="suggestion-list">
            {suggestion.map((ex) => {
              const isLoadBased = ex.intensity_type === 'load_based';
              const alreadyLoggedToday = loggedTodayTitles.has(ex.name);
              return (
                <div key={ex.id} className="suggestion-card">
                  <h4>{ex.name}</h4>
                  {alreadyLoggedToday && (
                    <p className="already-logged-badge">Logged today ✓</p>
                  )}
                  <p><strong>Muscle:</strong> {ex.primary_muscle}</p>
                  <p><strong>Suggested:</strong> {ex.recommended_sets} sets x {ex.recommended_reps_range} reps</p>
                  <p><strong>Est. time:</strong> {ex.estimated_time_minutes} min</p>

                  {isLoadBased ? (
                    <>
                      <label>Weight used (kg):</label>
                      <input
                        type="number"
                        placeholder="e.g. 40"
                        value={logInputs[ex.id]?.load ?? ''}
                        onChange={(e) => updateInput(ex.id, 'load', e.target.value)}
                      />
                    </>
                  ) : (
                    <p className="field-hint">No weight needed for this exercise</p>
                  )}

                  <label>Reps:</label>
                  <input
                    type="number"
                    value={logInputs[ex.id]?.reps ?? ''}
                    onChange={(e) => updateInput(ex.id, 'reps', e.target.value)}
                  />

                  <label>Sets:</label>
                  <input
                    type="number"
                    value={logInputs[ex.id]?.sets ?? ''}
                    onChange={(e) => updateInput(ex.id, 'sets', e.target.value)}
                  />

                  <button
                    onClick={() => handleLogExercise(ex)}
                    disabled={alreadyLoggedToday}
                  >
                    {alreadyLoggedToday ? 'Logged ✓' : 'Log this'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;