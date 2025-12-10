import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#121212] box-border overflow-hidden">
      <header className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen">
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
          onClick={() => navigate("/login")}
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 text-center">Forgot Password</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto pt-[144px] pb-[calc(200px+env(safe-area-inset-bottom))] px-5 py-4">
        <div className="w-full max-w-[600px] mx-auto">
          {!submitted ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  className="form-input dark:!text-white dark:!bg-[#2b2b2b] dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {error ? (
                  <p className="text-[#d32f2f] dark:text-[#ffcdd2] bg-[#ffeaea] dark:bg-[#5c1f1f] py-2 px-2 rounded-md mb-3 text-center text-[0.95em]">
                    {error}
                  </p>
                ) : ''}

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <p className="text-[#2e7d32] dark:text-[#a5d6a7] bg-[#e8f5e9] dark:bg-[#1b5e20] py-3 px-4 rounded-md mb-4 text-[1em]">
                ✓ Reset link sent! Check your email for instructions.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you don't see the email, check your spam folder.
              </p>
              <button 
                onClick={() => navigate("/login")}
                className="btn btn-primary"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
