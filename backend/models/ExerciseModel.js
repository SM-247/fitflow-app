const mongoose = require('mongoose')
const Schema = mongoose.Schema

const exerciseSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String },
    primary_muscle: { type: String },
    secondary_muscles: [{ type: String }],
    equipment: { type: String },
    location: { type: String },
    difficulty: { type: String },
    movement_pattern: { type: String },
    recommended_sets: { type: Number },
    recommended_reps_range: { type: String },
    rest_seconds: { type: Number },
    is_compound: { type: Boolean },
    fatigue_score: { type: Number },
    intensity_type: { type: String },
    estimated_time_minutes: { type: Number }
})

module.exports = mongoose.model('Exercise', exerciseSchema)