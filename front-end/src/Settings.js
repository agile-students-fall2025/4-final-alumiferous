import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const Settings = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
    navigate("/home");
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <main className="flex flex-col min-h-screen pt-[65px] bg-white dark:bg-[#121212] box-border transition-colors duration-300">
      <header className="fixed top-[65px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-full shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto pt-[72px] pb-[calc(80px+env(safe-area-inset-bottom))] px-5 py-4">
        <div className="flex flex-col gap-0 w-full max-w-[600px] mx-auto">
          {/* Account Section */}
          <div className="bg-white dark:bg-[#1e1e1e] border-b border-[#e6e6e6] dark:border-[#2c2c2c] overflow-hidden first:rounded-t-xl last:rounded-b-xl last:border-b-0">
            <button className="flex justify-between items-center w-full px-[18px] py-4 border-none bg-transparent text-base font-normal text-[#333] dark:text-[#f1f1f1] cursor-pointer transition-colors duration-200 text-left min-h-[56px] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] active:bg-[#e9ecef] dark:active:bg-[#333]" onClick={toggleTheme}>
              <span>Appearance</span>
              <span className="text-[#888] dark:text-[#aaa] text-[15px]">{darkMode ? "Dark" : "Light"}</span>
            </button>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-[#1e1e1e] border-b border-[#e6e6e6] dark:border-[#2c2c2c] overflow-hidden">
            <button
              className="flex justify-between items-center w-full px-[18px] py-4 border-none bg-transparent text-base font-normal text-[#333] dark:text-[#f1f1f1] cursor-pointer transition-colors duration-200 text-left min-h-[56px] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] active:bg-[#e9ecef] dark:active:bg-[#333]"
              onClick={() => navigate("/reset-password")}
            >
              <span>Reset Password</span>
              <span className="text-[#ccc] dark:text-[#555] text-2xl font-light">›</span>
            </button>
          </div>

          {/* Support Section */}
          <div className="bg-white dark:bg-[#1e1e1e] border-b border-[#e6e6e6] dark:border-[#2c2c2c] overflow-hidden">
            <button
              className="flex justify-between items-center w-full px-[18px] py-4 border-none bg-transparent text-base font-normal text-[#333] dark:text-[#f1f1f1] cursor-pointer transition-colors duration-200 text-left min-h-[56px] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] active:bg-[#e9ecef] dark:active:bg-[#333]"
              onClick={() => navigate("/report-problem")}
            >
              <span>Report a Problem</span>
              <span className="text-[#ccc] dark:text-[#555] text-2xl font-light">›</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="bg-white dark:bg-[#1e1e1e] border-b border-[#e6e6e6] dark:border-[#2c2c2c] overflow-hidden last:rounded-b-xl last:border-b-0">
              <button
                className="flex justify-between items-center w-full px-[18px] py-4 border-none bg-transparent text-base font-normal text-[#333] dark:text-[#f1f1f1] cursor-pointer transition-colors duration-200 text-left min-h-[56px] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a] active:bg-[#e9ecef] dark:active:bg-[#333]"
                onClick={handleLogoutClick}
              >
                <span>Logout</span>
              </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-[#1e1e1e] border-b-0 overflow-hidden mt-8 rounded-xl">
            <button
              className="flex justify-center items-center w-full px-[18px] py-4 border-none bg-transparent text-base font-medium text-[#e63946] dark:text-[#ff5c5c] cursor-pointer transition-colors duration-200 text-left min-h-[56px] hover:bg-[#ffecec] dark:hover:bg-[#3a1a1e] active:bg-[#e9ecef] dark:active:bg-[#333]"
              onClick={() => navigate("/delete-account")}
            >
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={handleLogoutCancel}>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 w-[90%] max-w-[400px] shadow-[0_8px_24px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold m-0 mb-3 text-[#333] dark:text-[#f1f1f1]">Logout</h3>
            <p className="text-base text-[#666] dark:text-[#ccc] m-0 mb-6 leading-[1.5]">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button className="btn" onClick={handleLogoutCancel}>
                No
              </button>
              <button className="btn btn-primary" onClick={handleLogoutConfirm}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
