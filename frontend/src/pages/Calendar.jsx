import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
const Calendar = () => {
  const { user } = useAuthContext();
  const { workouts, dispatch } = useWorkoutsContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_WORKOUTS', payload: null });
      navigate('/login');
    }
  }, [user, navigate, dispatch]);
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

  if (!workouts) {
    return <div className="calendar-page"><p>Loading calendar...</p></div>;
  }

  // group workouts by date string (YYYY-MM-DD)
  const workoutsByDate = {};
  workouts.forEach((w) => {
    const dateKey = toLocalDateKey(w.createdAt);
    if (!workoutsByDate[dateKey]) workoutsByDate[dateKey] = [];
    workoutsByDate[dateKey].push(w);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startWeekday = firstDayOfMonth.getDay();

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateKey = toLocalDateKey(dateObj);  
    const hasWorkout = !!workoutsByDate[dateKey];
    const isSelected = selectedDate === dateKey;

    cells.push(
      <div
        key={dateKey}
        className={`calendar-cell ${hasWorkout ? 'has-workout' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedDate(isSelected ? null : dateKey)}
      >
        <span>{day}</span>
        {hasWorkout && <div className="workout-dot"></div>}
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <h2>Training Calendar</h2>

      <div className="calendar-header">
        <button onClick={goToPrevMonth}>&larr;</button>
        <h3>{monthName} {year}</h3>
        <button onClick={goToNextMonth}>&rarr;</button>
      </div>

      <div className="calendar-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells}
      </div>

      {selectedDate && workoutsByDate[selectedDate] && (
        <div className="day-detail">
          <h3>{selectedDate}</h3>
          {workoutsByDate[selectedDate].map((w) => (
            <div key={w._id} className="day-detail-item">
              <strong>{w.title}</strong> — {w.sets} sets x {w.reps} reps
              {w.load > 0 && ` @ ${w.load}kg`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;