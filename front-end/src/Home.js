import React, { useState } from 'react';
import './Home.css';
import Skill from './Skill';
import { skills } from "./skills";

const Home = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const handleHover = (name) => {
    setHoveredSkill(name);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <input type="text" placeholder="Search a skill" />
      </header>

      {/* Optional feedback display */}
      {hoveredSkill && (
        <div className="hover-feedback">
          Hovering on: <strong>{hoveredSkill}</strong>
        </div>
      )}

      <div className="skill-grid">
        {skills.map((skill, i) => (
          <Skill
            key={i}
            id={skill.id}       
            name={skill.name}
            brief={skill.brief}
            skillImg={skill.img}
            handleHover={handleHover}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;


// const skills = [
//   { name: "Public Speaking", brief: "Confident presentations and speeches.", img: `${process.env.PUBLIC_URL}/images/public-speaking.jpg` },
//   { name: "Python", brief: "Programming and data analysis using Python.", img: `${process.env.PUBLIC_URL}/images/python.jpeg` },
//   { name: "Graphic Design", brief: "Creating visuals with Adobe Illustrator.", img: `${process.env.PUBLIC_URL}/images/graphic-design.jpeg` },
//   { name: "Video Editing", brief: "Editing videos in Premiere Pro and Final Cut.", img: `${process.env.PUBLIC_URL}/images/video-editing.jpeg` },
//   { name: "Spanish", brief: "Conversational and written fluency.", img: `${process.env.PUBLIC_URL}/images/spanish.jpg` },
//   { name: "Photography", brief: "Portrait and landscape photography.", img: `${process.env.PUBLIC_URL}/images/photography.jpg` },
//   { name: "Web Development", brief: "Building with HTML, CSS, JavaScript.", img: `${process.env.PUBLIC_URL}/images/web-development.jpg` },
//   { name: "Knitting", brief: "Handmade scarves and crafts.", img: `${process.env.PUBLIC_URL}/images/knitting.jpeg` },
//   { name: "Cooking", brief: "Recipe development and world cuisines.", img: `${process.env.PUBLIC_URL}/images/cooking.jpg` },
//   { name: "3D Modeling", brief: "Creating 3D assets for games and animation.", img: `${process.env.PUBLIC_URL}/images/3d-modeling.jpeg` },
//   { name: "Teaching", brief: "Experienced in classroom and online instruction.", img: `${process.env.PUBLIC_URL}/images/teaching.jpg` },
//   { name: "Project Management", brief: "Managing teams and deadlines effectively.", img: `${process.env.PUBLIC_URL}/images/project-management.jpg` }
// ];


  