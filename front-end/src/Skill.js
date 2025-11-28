import React, { useState, useContext } from "react";
import "./Skill.css";
import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { SkillsContext } from "./SkillsContext";

const Skill = ({ skillId, name, brief, image, ImgHeight }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { handleSaveSkill, handleHideSkill } = useContext(SkillsContext);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSave = () => {
    handleSaveSkill(skillId);
    setIsMenuOpen(false);
    showNotification('Skill Saved', 'success');
  };

  const handleHide = () => {
    handleHideSkill(skillId);
    setIsMenuOpen(false);
    showNotification('Skill Hidden', 'success');
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    showNotification('Issue Reported', 'info');
  };

  return (
    <div className="skill-wrapper">
      <div className="skill-card" data-height ={ImgHeight}>
        <Link to={`/skills/${encodeURIComponent(skillId)}`}>
          {image ? (
            <img src={image} alt={name} className="skill-image" />
          ) : (
            // If no image is provided by the backend, render nothing (per product decision)
            <div className="skill-image missing" />
          )}
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
              <li onClick={handleSave}>Save Skill</li>
              <li onClick={handleReport}>Report Abuse</li>
              <li onClick={handleHide}>Hide</li>
            </ul>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Skill;
