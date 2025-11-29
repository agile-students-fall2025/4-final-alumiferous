import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="app-title" onClick={() => navigate("/Home")}>
          InstaSkill
        </h1>
      </div>
    </header>
  );
};

export default Header;
