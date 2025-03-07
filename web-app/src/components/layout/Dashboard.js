import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const Dashboard = ({ children }) => {
  const { licenseKey, appSettings, onLogout } = useApp();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date: DD/MM/YYYY
      const date = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Format time: HH:MM:SS
      const time = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      setCurrentDate(date);
      setCurrentTime(time);
    };

    // Update immediately and then every second
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle navigation
  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/dashboard/');
  };

  // Handle refresh data
  const handleRefreshData = () => {
    // Refresh the page to reload all data
    window.location.reload();
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="sidebar">
          <div className="sidebar-logo">
            <img src={`${process.env.PUBLIC_URL}/assets/USDT_FLASHER_Logo.png`} alt="Logo" />
          </div>
          
          <nav className="nav-menu">
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span className="nav-icon grid-icon"></span>
              <span className="nav-text">Create Flash</span>
            </Link>
            
            <Link 
              to="/dashboard/history" 
              className={`nav-item ${isActive('/dashboard/history') ? 'active' : ''}`}
            >
              <span className="nav-icon history-icon"></span>
              <span className="nav-text">Flash history</span>
            </Link>
            
            <Link 
              to="/dashboard/support" 
              className={`nav-item ${isActive('/dashboard/support') ? 'active' : ''}`}
            >
              <span className="nav-icon support-icon"></span>
              <span className="nav-text">support</span>
            </Link>
          </nav>
          
          <div className="sidebar-footer">
            <p>USDT FLASHER PRO {appSettings?.appVersion || 'V4.8'}</p>
            <div className="footer-buttons">
              <button 
                id="refresh-data-btn" 
                className="refresh-btn" 
                title="Refresh data from server"
                onClick={handleRefreshData}
              >
                <span className="refresh-icon">↻</span> Sync
              </button>
              
              <button 
                id="logout-btn" 
                className="logout-btn"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="content-area">
          {React.cloneElement(children, { 
            licenseKey, 
            currentDate, 
            currentTime 
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
