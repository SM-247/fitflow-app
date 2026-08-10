import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages & components
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NavBar from './components/NavBar'
import Generate from './pages/Generate';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import ExerciseLibrary from './pages/ExerciseLibrary';
function App() {
  const { user , isLoading} = useAuthContext()
if (isLoading) {
    return <div className="App"><p>Loading...</p></div>
  }
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <div className="pages">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/" />} 
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;