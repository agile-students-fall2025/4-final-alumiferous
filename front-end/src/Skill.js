import React, { useState } from 'react';
import './Skill.css';

const Skill = ({ name, brief, skillImg, handleHover }) => {
  const [isHovered, setIsHovered] = useState(false);

  //
  const onEnter = () => {
    setIsHovered(true);
    //handleHover(name);
  };

  const onLeave = () => {
    setIsHovered(false);
    //handleHover(null);
  };

  return (
    <div
      className="skill-card"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <img src={skillImg} alt={name} className={isHovered ? "dimmed" : ""} />
      
      {/* Dynamic overlay */}
      <div className={`skill-overlay ${isHovered ? "visible" : ""}`}>
        <h3>{name}</h3>
        <p>{brief}</p>
      </div>
    </div>
  );
};

export default Skill;
