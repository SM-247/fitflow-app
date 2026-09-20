const Workout = require('../Models/WorkoutModel')
const mongoose = require('mongoose')

const getWorkouts = async (req, res) => {
    try {
        const user_id = req.user._id
        const workouts = await Workout.find({ user_id }).sort({ createdAt: -1 })
        res.status(200).json(workouts)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const getWorkout = async (req, res) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        const workout = await Workout.findOne({ _id: id, user_id: req.user._id })
        if (!workout) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        res.status(200).json(workout)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const createWorkout = async (req, res) => {
    const { title, reps, load, sets } = req.body

    let emptyFields = []
    if (!title) emptyFields.push('title')
    if (!reps) emptyFields.push('reps')
    if (load === undefined || load === null || load === '') {
        emptyFields.push('load')
    }
    if (!sets) emptyFields.push('sets')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all the fields', emptyFields })
    }

    try {
        const user_id = req.user._id
        const workout = await Workout.create({ title, load, reps, sets, user_id })
        res.status(200).json(workout)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const deleteWorkout = async (req, res) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        const workout = await Workout.findOneAndDelete({ _id: id, user_id: req.user._id })
        if (!workout) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        res.status(200).json(workout)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const patchWorkout = async (req, res) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        const workout = await Workout.findOneAndUpdate(
            { _id: id, user_id: req.user._id },
            { ...req.body }
        )
        if (!workout) {
            return res.status(404).json({ error: "No such workout exist." })
        }
        res.status(200).json(workout)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

module.exports = {
    getWorkouts,
    getWorkout,
    createWorkout,
    deleteWorkout,
    patchWorkout
}