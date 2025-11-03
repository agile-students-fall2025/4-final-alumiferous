import React, { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import "./SavedSkillCard.css";

const SavedSkillCard = ({ skill, onUnsave, onReport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUnsave = () => {
    onUnsave(skill.skillId);
    setIsMenuOpen(false);
  };

  const handleReport = () => {
    onReport();
    setIsMenuOpen(false);
  };

  return (
    <div className="savedcard-wrapper">
      <div className="savedcard" data-height={skill.height}>
        <Link to={`/skills/${encodeURIComponent(skill.skillId)}`}>
          <img
            src={`//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`}
            alt={skill.name}
            className="savedcard-image"
            style={{ height: `${skill.height}px` }}
          />
        </Link>

        <button
          className="savedcard-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <EllipsisHorizontalIcon className="savedcard-menu-icon" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="savedcard-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div
            className="savedcard-menu-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{skill.name}</h3>
            <p>{skill.brief}</p>
            <ul>
              <li onClick={handleUnsave}>Unsave Skill</li>
              <li>View Details</li>
              <li onClick={handleReport}>Report</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSkillCard;
