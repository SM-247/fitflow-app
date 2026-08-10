import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { API_URL } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuthContext } from '../hooks/useAuthContext';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend
);

const toLocalDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getWeekKey = (date) => {
  const d = new Date(date);
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDays = (d - firstDayOfYear) / 86400000;
  const weekNum = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
};

const calculateWeeklyVolume = (workouts) => {
  const volumeByWeek = {};
  workouts.forEach((w) => {
    const key = getWeekKey(w.createdAt);
    const volume = (w.sets || 0) * (w.reps || 0) * (w.load || 0);
    volumeByWeek[key] = (volumeByWeek[key] || 0) + volume;
  });
  const sortedKeys = Object.keys(volumeByWeek).sort().slice(-8);
  return {
    labels: sortedKeys,
    data: sortedKeys.map((k) => volumeByWeek[k])
  };
};

const calculateMuscleDistribution = (workouts, exercises) => {
  const distribution = {};
  workouts.forEach((w) => {
    const match = exercises.find((ex) => ex.name === w.title);
    const muscle = match ? match.primary_muscle : 'unknown';
    distribution[muscle] = (distribution[muscle] || 0) + 1;
  });
  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
};

const calculatePRs = (workouts) => {
  const prs = {};
  workouts.forEach((w) => {
    if (!prs[w.title] || w.load > prs[w.title]) {
      prs[w.title] = w.load;
    }
  });
  return Object.entries(prs)
    .filter(([, load]) => load > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
};

const calculateStreak = (workouts) => {
  if (!workouts.length) return 0;

  const uniqueDates = [...new Set(
 workouts.map((w) => toLocalDateKey(w.createdAt))
  )].sort().reverse();

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateStr of uniqueDates) {
   const cursorStr = toLocalDateKey(cursor);
    if (dateStr === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const Dashboard = () => {
  const { user } = useAuthContext();
  const { workouts, dispatch } = useWorkoutsContext();
  const [exercises, setExercises] = useState([]);
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

    const fetchExercises = async () => {
      const response = await fetch(`${API_URL}/api/exercises`);
      const json = await response.json();
      if (response.ok) setExercises(json);
    };

    if (user) {
      fetchWorkouts();
      fetchExercises();
    }
  }, [dispatch, user]);

  if (!workouts) {
    return <div className="dashboard"><p>Loading dashboard...</p></div>;
  }

  if (workouts.length === 0) {
    return <div className="dashboard"><p>Log some workouts to see your dashboard.</p></div>;
  }

  const weeklyVolume = calculateWeeklyVolume(workouts);
  const muscleDist = calculateMuscleDistribution(workouts, exercises);
  const prs = calculatePRs(workouts);
  const streak = calculateStreak(workouts);

  const volumeChartData = {
    labels: weeklyVolume.labels,
    datasets: [{
      label: 'Weekly Volume (kg)',
      data: weeklyVolume.data,
      borderColor: '#333',
      backgroundColor: 'rgba(51,51,51,0.1)',
      tension: 0.3
    }]
  };

  const muscleChartData = {
    labels: muscleDist.labels,
    datasets: [{
      data: muscleDist.data,
      backgroundColor: ['#333','#666','#999','#bbb','#ddd','#eee','#555','#777']
    }]
  };

  const prChartData = {
    labels: prs.map(([name]) => name),
    datasets: [{
      label: 'Personal Record (kg)',
      data: prs.map(([, load]) => load),
      backgroundColor: '#333'
    }]
  };

  return (
    <div className="dashboard">
      <h2>Your Progress Dashboard</h2>

      <div className="stat-card">
        <h3>Current Streak</h3>
        <p className="streak-number">{streak} {streak === 1 ? 'day' : 'days'}</p>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Weekly Training Volume</h3>
          <Line data={volumeChartData} />
        </div>

        <div className="chart-card">
          <h3>Muscle Group Distribution</h3>
          <Doughnut data={muscleChartData} />
        </div>

        <div className="chart-card">
          <h3>Personal Records</h3>
          <Bar data={prChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;