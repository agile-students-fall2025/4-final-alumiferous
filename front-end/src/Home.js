import React, { useState } from 'react';
import './Home.css';
import Skill from './Skill';

const Home = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const handleHover = (name) => {
    setHoveredSkill(name);
  };

  const skills = [
    { name: "Lorem Skill 1", brief: "Lorem ipsum dolor sit amet.", img: `${process.env.PUBLIC_URL}/images/image1.jpeg` },
    { name: "Lorem Skill 2", brief: "Consectetur adipiscing elit.", img: `${process.env.PUBLIC_URL}/images/image2.jpeg` },
    { name: "Lorem Skill 3", brief: "Sed do eiusmod tempor incididunt.", img: `${process.env.PUBLIC_URL}/images/image3.jpeg` },
    { name: "Lorem Skill 4", brief: "Ut labore et dolore magna aliqua.", img: `${process.env.PUBLIC_URL}/images/image4.jpeg` },
    { name: "Lorem Skill 5", brief: "Ut enim ad minim veniam.", img: `${process.env.PUBLIC_URL}/images/image5.jpeg` },
    { name: "Lorem Skill 6", brief: "Quis nostrud exercitation ullamco.", img: `${process.env.PUBLIC_URL}/images/image6.jpeg` },
    { name: "Lorem Skill 7", brief: "Laboris nisi ut aliquip ex ea.", img: `${process.env.PUBLIC_URL}/images/image7.jpeg` },
    { name: "Lorem Skill 8", brief: "Commodo consequat duis aute irure.", img: `${process.env.PUBLIC_URL}/images/image8.jpeg` },
    { name: "Lorem Skill 9", brief: "Dolor in reprehenderit in voluptate.", img: `${process.env.PUBLIC_URL}/images/image9.jpeg` },
    { name: "Lorem Skill 10", brief: "Velit esse cillum dolore eu fugiat.", img: `${process.env.PUBLIC_URL}/images/image10.jpeg` }
  ];

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
