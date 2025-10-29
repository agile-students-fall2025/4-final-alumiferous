import React, { useState } from "react";
import "./DeleteAccount.css";
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
    <div className="delete-container">
      <div className="delete-box">
        <h2 className="delete-title">⚠️ Warning</h2>
        <p className="delete-text">
          You are about to permanently delete your account. <br />
          This action <strong>cannot be undone</strong> and all your data will
          be lost forever.
        </p>

        <form onSubmit={handleSubmit} className="delete-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirm}
              onChange={() => setConfirm(!confirm)}
            />
            I understand that this action cannot be undone.
          </label>

          <button type="submit" className="delete-submit">
            Delete My Account
          </button>
        </form>

        {deleted && (
          <div className="delete-popup">✅ Account successfully deleted</div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccount;
