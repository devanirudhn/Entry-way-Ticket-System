import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 mt-4 mx-4 rounded-2xl flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        <span className="gradient-text">EntryWay</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-slate-300 hidden md:block">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </div>
            
            {user.role === 'organizer' && (
              <Link to="/organizer-dashboard" className="text-sm font-medium hover:text-indigo-400 transition">
                Dashboard
              </Link>
            )}
            
            {user.role === 'attendee' && (
              <Link to="/attendee-dashboard" className="text-sm font-medium hover:text-indigo-400 transition">
                My Tickets
              </Link>
            )}

            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium hover:text-indigo-400 transition px-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
