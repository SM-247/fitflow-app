require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose')
const workoutRoutes = require('./routes/workouts')
const userRoutes = require('./routes/user')
const exerciseRoutes = require('./routes/exercises')
const generateRoutes = require('./routes/generate')
const cors = require('cors')

const app = express();

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    console.log(`${req.method} Request from ${req.path}`)
    next()
})

app.use('/api/workouts', workoutRoutes)
app.use('/api/user', userRoutes)
app.use('/api/exercises', exerciseRoutes)
app.use('/api/generate', generateRoutes)

mongoose.connect(process.env.MONGODB_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Connected to database and listening on port ${process.env.PORT}`)
    })
}).catch((err) => {
    console.log(err)
})