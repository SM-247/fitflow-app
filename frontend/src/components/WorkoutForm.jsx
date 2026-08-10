import { useState, useEffect } from "react"
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"
import { useAuthContext } from '../hooks/useAuthContext'
import { API_URL } from '../api';
const WorkoutForm = () => {
  const { dispatch } = useWorkoutsContext()
  const { user } = useAuthContext()

  const [exercises, setExercises] = useState([])
  const [title, setTitle] = useState('')
  const [load, setLoad] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState('')
  const [error, setError] = useState(null)
  const [emptyFields, setEmptyFields] = useState([])

  useEffect(() => {
    const fetchExercises = async () => {
      const response = await fetch(`${API_URL}/api/exercises`)
      const json = await response.json()
      if (response.ok) {
        setExercises(json)
      }
    }
    fetchExercises()
  }, [])

  const selectedExercise = exercises.find((ex) => ex.name === title)
  const isLoadBased = selectedExercise?.intensity_type === 'load_based'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    const workout = {
      title,
      load: isLoadBased ? load : 0,
      reps,
      sets
    }

    const response = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      body: JSON.stringify(workout),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
      setEmptyFields(json.emptyFields)
    }
    if (response.ok) {
      setTitle('')
      setLoad('')
      setReps('')
      setSets('')
      setError(null)
      setEmptyFields([])
      dispatch({ type: 'CREATE_WORKOUT', payload: json })
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a New Workout</h3>

      <label>Exercise:</label>
      <select
        onChange={(e) => { setTitle(e.target.value); setLoad(''); }}
        value={title}
        className={emptyFields.includes('title') ? 'error' : ''}
      >
        <option value="">-- Select an exercise --</option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.name}>{ex.name}</option>
        ))}
      </select>

      {isLoadBased && (
        <>
          <label>Load (in kg):</label>
          <input
            type="number"
            onChange={(e) => setLoad(e.target.value)}
            value={load}
            className={emptyFields.includes('load') ? 'error' : ''}
          />
        </>
      )}

      <label>Reps:</label>
      <input
        type="number"
        onChange={(e) => setReps(e.target.value)}
        value={reps}
        className={emptyFields.includes('reps') ? 'error' : ''}
      />

      <label>Sets:</label>
      <input
        type="number"
        onChange={(e) => setSets(e.target.value)}
        value={sets}
        className={emptyFields.includes('sets') ? 'error' : ''}
      />

      <button>Add Workout</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default WorkoutForm