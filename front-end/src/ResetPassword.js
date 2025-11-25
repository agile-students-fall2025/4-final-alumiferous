import React, { useState } from "react";
import "./ResetPassword.css";
import { useNavigate } from "react-router-dom";

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
    <div className="reset-page">
      <header className="reset-header">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          ←
        </button>
        <h1 className="reset-title">Reset Password</h1>
      </header>

      <div className="reset-body">
        <div className="reset-content">
          <form onSubmit={handleSubmit}>
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
              className="reset-submit"
              disabled={!allRequirementsMet}
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
