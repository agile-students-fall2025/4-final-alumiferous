import { useState } from "react";
import { Link } from "react-router-dom";
import "./Skill.css";

const Skill = ({ id, name, brief, skillImg, handleHover }) => {
  const [isHovered, setIsHovered] = useState(false);

  const onEnter = () => {
    setIsHovered(true);
    handleHover(name);
  };

  const onLeave = () => {
    setIsHovered(false);
    handleHover(null);
  };

  return (
    <Link
      to={`/skills/${id}`}
      className="skill-card"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <img src={skillImg} alt={name} className={isHovered ? "dimmed" : ""} />
      <div className={`skill-overlay ${isHovered ? "visible" : ""}`}>
        <h3>{name}</h3>
        <p>{brief}</p>
      </div>
    </Link>
  );
};

export default Skill;
