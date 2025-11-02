import React, { useState } from 'react';
import './Settings.css';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleReportProblem = () => {
    navigate('/report-problem');
  };

  const handleLogout = () => {
    localStorage.clear();
    alert('You have been logged out.');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
  navigate('/delete-account');
};


  return (
    <div className={`settings-container ${darkMode ? 'dark' : 'light'}`}>
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-body">
        <div className="settings-content">
        <button className="settings-btn" onClick={toggleTheme}>
          Appearance: {darkMode ? 'Dark' : 'Light'}
        </button>

        <button className="settings-btn" onClick={handleResetPassword}>
          Reset Password
        </button>

        <button className="settings-btn" onClick={handleReportProblem}>
          Report a Problem
        </button>

        <button className="settings-btn" onClick={handleLogout}>
          Logout
        </button>

        <button className="settings-btn delete" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;