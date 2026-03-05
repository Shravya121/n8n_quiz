import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/dashboard" className="navbar-logo">⚡ QuizAI</Link>
          {user && (
            <div className="navbar-user">
              <span style={{ display: 'none' }} className="desktop-only">
                {user.studentId} &bull; {user.name}
              </span>
              <div className="navbar-avatar" title={user.name}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
