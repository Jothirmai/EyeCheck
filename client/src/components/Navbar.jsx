import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleLogoClick}>
          <div className="logo">
            <span className="logo-icon">👁️</span>
            <span className="logo-text">Catract</span>
          </div>
        </div>
        
        <div className="navbar-menu">
          <div className="navbar-links">
            <button 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
              onClick={() => navigate('/history')}
            >
              History
            </button>
          </div>
          
          <div className="navbar-actions">
            <button 
              className="profile-btn"
              onClick={handleProfileClick}
              title="View Profile"
            >
              <span className="profile-icon">👤</span>
              <span className="profile-text">Profile</span>
            </button>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile menu button (hamburger) */}
        <div className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;