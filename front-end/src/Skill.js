import React, { useState } from "react";
import "./Skill.css";
import { Link } from "react-router-dom";

const Skill = ({ id, name, brief, skillImg, handleHover }) => {
  const [isHovered, setIsHovered] = useState(false);

  //get the path of a skill detail
  //use the skill name as a unique identifier and dynamic liink creator
  const path = `/skill/${encodeURIComponent(id)}`;

  const onEnter = () => {
    setIsHovered(true);
    //handleHover(name);
  };

  const onLeave = () => {
    setIsHovered(false);
    //handleHover(null);
  };

  return (
    <Link to={path} className="skill-card">
      <div onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <img src={skillImg} alt={name} className={isHovered ? "dimmed" : ""} />

        {/* Dynamic overlay */}
        <div className={`skill-overlay ${isHovered ? "visible" : ""}`}>
          <h3>{name}</h3>
          <p>{brief}</p>
        </div>
      </div>
    </Link>
  );
};

export default Skill;
