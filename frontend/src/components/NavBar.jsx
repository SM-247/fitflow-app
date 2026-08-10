import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h1>FitFlow</h1>
        </Link>
        <nav>
          {user && (
            <div>
              <Link to="/generate">Generate</Link>
               <Link to="/dashboard">Dashboard</Link>
                 <Link to="/calendar">Calendar</Link>
                 <Link to="/exercises">Exercises</Link>
              <button onClick={handleClick}>Log out</button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>

            </div>
          )}
          
        </nav>
      </div>
    </header>
  );
};

export default Navbar;