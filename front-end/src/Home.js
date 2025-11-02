import React, { useContext } from "react";
import "./Home.css";
import Skill from "./Skill";
import { SkillsContext } from "./SkillsContext";

const Home = () => {
  //import the already fetcted data from skill context
  const { skills, handleSaveSkill } = useContext(SkillsContext);

  //return all list components by looping through the array of skills
  
  return (
    
    <div className="home-container">
      <header className="home-header">
        <input type="text" placeholder="Search a skill" />
      </header>

      <div className="skill-grid">
        {skills.map((skill, i) => (
         
          <Skill //pass skill details as attributes to
            key={i}
            skillId={skill.skillId}
            name={skill.name}
            brief={skill.brief}
             //inject random place holder image form the Lorem Picsum API
            skillImg={`//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`}
            category = {skill.category}
            username = {skill.username}
            ImgHeight = {skill.height}
            handleSaveSkill = {handleSaveSkill}
          />
        )
         )}
      </div>
    </div>
  );
};

export default Home;
