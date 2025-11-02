import React, { useContext } from "react";
import { SkillsContext } from "./SkillsContext";
import Skill from "./Skill";
import "./Savedskills.css";

const Savedskills = () => {
  const { skills } = useContext(SkillsContext);

  // Filter out only saved skills
  const savedSkills = skills.filter(skill => skill.saved);

  return (
    
    <div className="savedskills-container">
       

      <header className="page-title">
        <h2>Saved Skills</h2>
      </header>

      <input
        className="saved-search-box"
        type="text"
        placeholder="Search for a saved skill"
      />

      

      <div className="skill-grid">
        {savedSkills.length > 0 ? (
          savedSkills.map((skill, i) => (
            <Skill
              key={i}
              skillId={skill.skillId}
              name={skill.name}
              brief={skill.brief}
              skillImg={`//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`}
              category={skill.category}
              username={skill.username}
              ImgHeight={skill.height}
            />
          ))
        ) : (
          <p className="no-saved">No saved skills yet. Go save some from Home!</p>
        )}
      </div>
    </div>
  );
};

export default Savedskills;
