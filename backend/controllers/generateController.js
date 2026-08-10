const Workout = require('../models/workoutModel')
const Exercise = require('../models/ExerciseModel')
const { generateWorkout } = require('../lib/workoutGenerator')
const { calculateRollingFatigue } = require('../lib/fatigueEngine')

const generateSession = async (req, res) => {
    const { location, energy, soreness, timeAvailable } = req.body

    if (!location || !energy || !soreness || !timeAvailable) {
        return res.status(400).json({ error: 'location, energy, soreness, and timeAvailable are required' })
    }

    try {
        // 1. Full exercise catalog
        const exerciseList = await Exercise.find({})

        // 2. This user's recent logged workouts (flat entries)
        const rawLogs = await Workout.find({ user_id: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)

        // 3. Group flat logs into session-shaped history, matching each
        //    logged title against the exercise catalog to get fatigue_score/movement_pattern
        const sessionsByDate = {}

        for (const log of rawLogs) {
            const dateKey = log.createdAt.toISOString().split('T')[0]
            const matchedExercise = exerciseList.find(ex => ex.name === log.title)

            if (!sessionsByDate[dateKey]) {
                sessionsByDate[dateKey] = { date: dateKey, exercises: [], totalFatigue: 0 }
            }

            const fatigueScore = matchedExercise ? matchedExercise.fatigue_score : 3 // fallback if no match found

            sessionsByDate[dateKey].exercises.push({
                id: matchedExercise ? matchedExercise.id : null,
                name: log.title,
                movement_pattern: matchedExercise ? matchedExercise.movement_pattern : null,
                fatigue_score: fatigueScore
            })
            sessionsByDate[dateKey].totalFatigue += fatigueScore
        }

        const recentWorkouts = Object.values(sessionsByDate).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        )

        // 4. Run the actual engine
        const suggestion = generateWorkout({
            exerciseList,
            location,
            energy: Number(energy),
            soreness: Number(soreness),
            timeAvailable: Number(timeAvailable),
            recentWorkouts
        })

        res.status(200).json({
            suggestion,
            rollingFatigue: calculateRollingFatigue(recentWorkouts, 3)
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

module.exports = { generateSession }