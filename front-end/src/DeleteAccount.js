import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !confirm) {
      setError("Please fill out all fields and check the confirmation box.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDeleted(true);
        
        // Clear all localStorage data
        localStorage.clear();
        
        // Force reload the page to clear any cached state and redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      } else {
        setError(data.message || "Failed to delete account. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-[#f8f9fa] dark:bg-[#121212] px-5 py-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 w-full max-w-[500px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-bold text-[#dc3545] dark:text-[#ff5c5c] mb-4 text-center">⚠️ Warning</h2>
        <p className="text-[#6c757d] dark:text-[#aaa] text-center leading-[1.6] mb-6">
          You are about to permanently delete your account. <br />
          This action <strong>cannot be undone</strong> and all your data will
          be lost forever.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-[#6c757d] dark:text-[#aaa] cursor-pointer">
            <input
              type="checkbox"
              checked={confirm}
              onChange={() => setConfirm(!confirm)}
              className="w-4 h-4 cursor-pointer"
            />
            I understand that this action cannot be undone.
          </label>

          <button type="submit" className="btn btn-danger w-full mt-2" disabled={loading}>
            {loading ? "Deleting Account..." : "Delete My Account"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-[#f8d7da] dark:bg-[#721c24] text-[#721c24] dark:text-[#f8d7da] rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {deleted && (
          <div className="mt-4 p-4 bg-[#d4edda] dark:bg-[#155724] text-[#155724] dark:text-[#d4edda] rounded-lg text-center font-medium">
            ✅ Account successfully deleted
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccount;
