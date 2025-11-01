import React, { useState } from "react";
import "./Skill.css";
import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const Skill = ({ id, name, brief, skillImg, username, category }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const path = `/skills/${encodeURIComponent(id)}`;

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <div className="skill-wrapper">
      {/* Skill card */}
      <Link to={path} className="skill-card">
        <img src={skillImg} alt={name} />
      </Link>

      {/* Menu button */}
      <button className="skill-menu-button" onClick={handleMenuToggle}>
        <EllipsisHorizontalIcon className="skill-menu-options" />
      </button>

      {/* Pop-up menu modal */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={handleCloseMenu}>
          <div
            className="skill-menu-popup"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3>{name}</h3>
            <p>{brief}</p>
            <ul>
              <li onClick={() => alert(`Saved ${name}`)}>Save Skill</li>
              <li onClick={() => alert(`Reported ${username}`)}>Report Abuse</li>
              <li onClick={() => alert(`Hidden ${name}`)}>Hide</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skill;
