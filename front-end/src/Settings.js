import React, { useContext } from "react";
import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const Settings = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <main className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-body">
        <div className="settings-content">
          {/* Account Section */}
          <div className="settings-section">
            <button className="settings-btn" onClick={toggleTheme}>
              <span>Appearance</span>
              <span className="settings-value">{darkMode ? "Dark" : "Light"}</span>
            </button>
          </div>

          {/* Security Section */}
          <div className="settings-section">
            <button
              className="settings-btn"
              onClick={() => navigate("/reset-password")}
            >
              <span>Reset Password</span>
              <span className="settings-arrow">›</span>
            </button>
          </div>

          {/* Support Section */}
          <div className="settings-section">
            <button
              className="settings-btn"
              onClick={() => navigate("/report-problem")}
            >
              <span>Report a Problem</span>
              <span className="settings-arrow">›</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="settings-section">
              <button
                className="settings-btn"
                onClick={async () => {
                  try {
                    await fetch("http://localhost:4000/api/auth/logout", {
                      method: "POST",
                      credentials: "include"
                    });
                  } catch (err) {
                    console.error("Logout request failed:", err);
                  }
                  localStorage.clear();
                  alert("You have been logged out.");
                  navigate("/login");
                }}
              >
                <span>Logout</span>
              </button>
          </div>

          {/* Danger Zone */}
          <div className="settings-section danger">
            <button
              className="settings-btn delete"
              onClick={() => navigate("/delete-account")}
            >
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
