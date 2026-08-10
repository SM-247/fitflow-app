require('dotenv').config()
const mongoose = require('mongoose')
const Exercise = require('./models/ExerciseModel')
const exerciseList = require('./data/exercise_list.json')

const seedExercises = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    await Exercise.deleteMany({})
    await Exercise.insertMany(exerciseList)
    console.log(`Seeded ${exerciseList.length} exercises successfully`)
    process.exit()
}

seedExercises().catch((err) => {
    console.log(err)
    process.exit(1)
})