import React, { useState } from "react";
import "./Home.css";
import Skill from "./Skill";
import { Link } from "react-router-dom";

const Home = () => {
  //const [hoveredSkill, setHoveredSkill] = useState(null);

  //event handler for hovering event
  const handleClick = (name) => { //
    //setHoveredSkill(name);
    <Link to=''/>
  };

  // array to each skill card
  const skills = [
  {
    id: "public-speaking",
    name: "Public Speaking",
    brief: "Confident presentations and speeches.",
    img: `${process.env.PUBLIC_URL}/images/public-speaking.jpg`,
    category: "Communication",
  },
  {
    id: "python",
    name: "Python",
    brief: "Programming and data analysis using Python.",
    img: `${process.env.PUBLIC_URL}/images/python.jpeg`,
    category: "Programming",
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    brief: "Creating visuals with Adobe Illustrator.",
    img: `${process.env.PUBLIC_URL}/images/graphic-design.jpeg`,
    category: "Design",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    brief: "Editing videos in Premiere Pro and Final Cut.",
    img: `${process.env.PUBLIC_URL}/images/video-editing.jpeg`,
    category: "Media",
  },
  {
    id: "spanish",
    name: "Spanish",
    brief: "Conversational and written fluency.",
    img: `${process.env.PUBLIC_URL}/images/spanish.jpg`,
    category: "Language",
  },
  {
    id: "photography",
    name: "Photography",
    brief: "Portrait and landscape photography.",
    img: `${process.env.PUBLIC_URL}/images/photography.jpg`,
    category: "Media",
  },
  {
    id: "web-development",
    name: "Web Development",
    brief: "Building with HTML, CSS, JavaScript.",
    img: `${process.env.PUBLIC_URL}/images/web-development.jpg`,
    category: "Programming",
  },
  {
    id: "knitting",
    name: "Knitting",
    brief: "Handmade scarves and crafts.",
    img: `${process.env.PUBLIC_URL}/images/knitting.jpeg`,
    category: "Crafts",
  },
  {
    id: "cooking",
    name: "Cooking",
    brief: "Recipe development and world cuisines.",
    img: `${process.env.PUBLIC_URL}/images/cooking.jpg`,
    category: "Culinary",
  },
  {
    id: "3d-modeling",
    name: "3D Modeling",
    brief: "Creating 3D assets for games and animation.",
    img: `${process.env.PUBLIC_URL}/images/3d-modeling.jpeg`,
    category: "Design",
  },
  {
    id: "teaching",
    name: "Teaching",
    brief: "Experienced in classroom and online instruction.",
    img: `${process.env.PUBLIC_URL}/images/teaching.jpg`,
    category: "Education",
  },
  {
    id: "project-management",
    name: "Project Management",
    brief: "Managing teams and deadlines effectively.",
    img: `${process.env.PUBLIC_URL}/images/project-management.jpg`,
    category: "Business",
  },
];


  //return all list components my looping through the array of skills
  return (
    <div className="home-container">
      <header className="home-header">
        <input type="text" placeholder="Search a skill" />
      </header>

      <div className="skill-grid">
        {skills.map((skill, i) => (
          <Skill //pass skill details as attributes to 
            key={i}
            id = {skill.id}
            name={skill.name}
            brief={skill.brief}
            skillImg={skill.img}
            //handleHover={handleHover}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
