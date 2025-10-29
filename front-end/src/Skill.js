import React, { useState } from "react";
import "./Skill.css";
import { Link } from "react-router-dom";

const Skill = ({ id, name, brief, skillImg }) => {
  const [isHovered, setIsHovered] = useState(false);
  const path = `/skills/${encodeURIComponent(id)}`;

  const onEnter = () => setIsHovered(true);
  const onLeave = () => setIsHovered(false);

  return (
    <Link to={path} className="skill-card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <img src={skillImg} alt={name} className={isHovered ? "dimmed" : ""} />
      <div className={`skill-overlay ${isHovered ? "visible" : ""}`}>
        <h3>{name}</h3>
        <p>{brief}</p>
      </div>
    </Link>
  );
};

export default Skill;
