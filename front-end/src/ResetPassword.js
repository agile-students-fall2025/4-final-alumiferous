import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Password validation checks
  const hasMinLength = newPassword.length >= 6;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const allRequirementsMet = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar && passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (!allRequirementsMet) {
      setError("Please meet all password requirements.");
      return;
    }

    setSubmitted(true);
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setSubmitted(false);
      navigate("/settings");
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#121212] box-border overflow-hidden">
      <header className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate("/settings")}>
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 text-center">Reset Password</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto pt-[144px] pb-[calc(200px+env(safe-area-inset-bottom))] px-5 py-4">
        <div className="w-full max-w-[600px] mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-input"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {newPassword && (
              <div className="password-requirements">
                <div className={`requirement ${hasMinLength ? 'met' : ''}`}>
                  <span className="requirement-icon">{hasMinLength ? '✓' : '○'}</span>
                  At least 6 characters
                </div>
                <div className={`requirement ${hasUpperCase ? 'met' : ''}`}>
                  <span className="requirement-icon">{hasUpperCase ? '✓' : '○'}</span>
                  One uppercase letter
                </div>
                <div className={`requirement ${hasLowerCase ? 'met' : ''}`}>
                  <span className="requirement-icon">{hasLowerCase ? '✓' : '○'}</span>
                  One lowercase letter
                </div>
                <div className={`requirement ${hasSpecialChar ? 'met' : ''}`}>
                  <span className="requirement-icon">{hasSpecialChar ? '✓' : '○'}</span>
                  One special character
                </div>
                <div className={`requirement ${passwordsMatch ? 'met' : ''}`}>
                  <span className="requirement-icon">{passwordsMatch ? '✓' : '○'}</span>
                  Passwords match
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full"
            >
              Reset Password
            </button>
          </form>

          {submitted && (
            <div className="reset-popup">
              Your password has been reset successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
