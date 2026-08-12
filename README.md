# FitFlow — Smart Workout Planner

A full-stack fitness web app where users log workouts, track progress over time, and receive dynamically generated workout plans based on their fitness level and daily readiness.

🔗 **Live demo:** https://fitflow-app-three.vercel.app
> Note: backend is hosted on Render's free tier, which spins down after inactivity — first request may take ~30s to wake up.

## Features
- **User authentication** — JWT-based signup/login, each user's data is fully isolated
- **Rule-based workout generation engine** — auto-generates sessions by balancing muscle group rotation, progressive overload, fatigue limits, and available time, based on daily energy/soreness check-ins
- **Progress dashboards** — Chart.js visualizations for weekly training volume, muscle group distribution, personal records, and streak tracking
- **Training calendar** — visual history of logged workouts by date
- **Exercise library** — searchable, filterable database of 70+ exercises
- **Manual workout logging** — full CRUD with per-exercise weight/reps/sets tracking

## Tech Stack
- **Frontend:** React (Vite), React Router, Chart.js, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt
- **Deployment:** Vercel (frontend), Render (backend)

## Architecture
The workout generation engine is a set of pure functions (`fatigueEngine`, `workoutGenerator`, `movementBalancer`, `progressionEngine`) that take a user's exercise catalog and recent history as input and return a suggested session — fully decoupled from the database layer, making the logic independently testable.

## Screenshots

**Adaptive workout generation** — the engine balances fatigue, muscle rotation, and time constraints based on daily energy/soreness check-ins, with per-exercise logging and same-day repeat detection.
<img width="1000" height="500" alt="Screenshot 2026-08-12 161216" src="https://github.com/user-attachments/assets/6c5ffef0-b3d4-48f6-8239-6fa2c3262a1c" />


**Progress dashboard** — Chart.js visualizations for weekly training volume, muscle group distribution, and personal records, computed from real workout history.
<img width="1000" height="500" alt="Screenshot 2026-08-12 161256" src="https://github.com/user-attachments/assets/27cb0e40-c237-4a8e-831f-e77e88d49ae9" />


**Training calendar** — visual history of logged workouts by date, with a day-by-day breakdown of exercises performed.
<img width="500" height="500" alt="Screenshot 2026-08-12 161356" src="https://github.com/user-attachments/assets/81d7c5c9-5da7-4dc6-a69d-104d6381ae3e" />

## Local Setup

**Backend**

```bash
cd backend
npm install
```

Create `.env` with `MONGODB_URI`, `SECRET`, and `PORT`.

```bash
npm start
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Future Improvements
- Persist "already logged today" state across sessions/devices (currently derived per-visit)
- Optional fixed weekly split mode alongside the adaptive engine
- Display name field separate from email
- Deeper mobile-first redesign
- Server-side aggregation for dashboard stats (currently computed client-side)
