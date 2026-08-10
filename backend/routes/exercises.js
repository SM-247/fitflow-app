const express = require('express')
const Exercise = require('../Models/ExerciseModel')
const router = express.Router()

router.get('/', async (req, res) => {
    const exercises = await Exercise.find({}).sort({ name: 1 })
    res.status(200).json(exercises)
})

module.exports = router