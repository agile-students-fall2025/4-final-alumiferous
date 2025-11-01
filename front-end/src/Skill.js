import React, { useState } from "react";
import "./Skill.css";
import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const Skill = ({ skillId, name, brief, skillImg }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="skill-wrapper">
      <div className="skill-card">
        <Link to={`/skills/${encodeURIComponent(skillId)}`}>
          <img src={skillImg} alt={name} className="skill-image" />
        </Link>

        {/* Floating more-options button */}
        <button className="skill-menu-button" onClick={toggleMenu}>
          <EllipsisHorizontalIcon className="skill-menu-icon" />
        </button>
      </div>

      {/* Pop-up menu */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="skill-menu-popup" onClick={(e) => e.stopPropagation()}>
            <h3>{name}</h3>
            <p>{brief}</p>
            <ul>
              <li>Save Skill</li>
              <li>Report Abuse</li>
              <li>Hide</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skill;
