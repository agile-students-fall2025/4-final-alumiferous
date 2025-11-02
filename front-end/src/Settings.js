import React, { useContext } from "react";
import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const Settings = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className={`settings-container ${darkMode ? "dark" : "light"}`}>
      <div className="settings-content">
        <button className="settings-btn" onClick={toggleTheme}>
          Appearance: {darkMode ? "Dark" : "Light"}
        </button>

        <button className="settings-btn" onClick={() => navigate("/reset-password")}>
          Reset Password
        </button>
        <button className="settings-btn" onClick={() => navigate("/report-problem")}>
          Report a Problem
        </button>
        <button className="settings-btn" onClick={() => {
          localStorage.clear();
          alert("You have been logged out.");
          navigate("/login");
        }}>
          Logout
        </button>
        <button className="settings-btn delete" onClick={() => navigate("/delete-account")}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
