import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password || !confirm) {
      alert("Please fill out all fields and check the confirmation box.");
      return;
    }
    setDeleted(true);

    setTimeout(() => {
      navigate("/login");
    }, 2500);
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

          <button type="submit" className="btn btn-danger w-full mt-2">
            Delete My Account
          </button>
        </form>

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
