import React, { useEffect, useState } from "react";
import "./Home.css";
import Skill from "./Skill";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  //const [hoveredSkill, setHoveredSkill] = useState(null);

  //a state variable with a blank array
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    //create a local storage to prevent unneccesary API calls
    const cached = localStorage.getItem("skills")
    if(cached){
      //if there is cached data use it as the skills data and return
      setSkills(JSON.parse(cached));
      return // skip the API call
    }
    //fetch data from mock API
    console.log("fetching skill details...");
    axios("https://my.api.mockaroo.com/skills.json?key=4e009220")
      .then(
        //callback to be returned when the call is successful
        (response) => {
          //update the data fected with the image ratio
          const updatedData = response.data.map((skill) => ({
            ...skill,
            width: Math.floor(Math.random() * 80) + 150,
            height: Math.floor(Math.random() * 100) + 200,
            
          }));
          setSkills(updatedData); //set skills data to updated data
          localStorage.setItem("skills",JSON.stringify(updatedData)) //set the newly fected data to local storage
        }
      )
      .catch((err) => {
        //incase mockaroo API call fails
        console.log("Mock API call failed");
        console.error(err);

        //use backup data
        const backupSkills = [
          {
            skillId: 1,
            name: "Public Speaking",
            brief: "Confident presentations and speeches.",
            detail:
              "Deliver powerful speeches and communicate ideas effectively through audience-centered presentations and storytelling.",
            image: `${process.env.PUBLIC_URL}/images/public-speaking.jpg`,
            userId: 1,
            username: "jsmith",
            category: "Public Relations",
          },
          {
            skillId: 2,
            name: "Python",
            brief: "Programming and data analysis using Python.",
            detail:
              "Learn to write efficient scripts, analyze data, and build software using Python's extensive libraries.",
            image: `${process.env.PUBLIC_URL}/images/python.jpeg`,
            userId: 2,
            username: "amorgan",
            category: "Technology",
          },
          {
            skillId: 3,
            name: "Graphic Design",
            brief: "Creating visuals with Adobe Illustrator.",
            detail:
              "Explore typography, layout, and color to produce creative designs using modern digital tools.",
            image: `${process.env.PUBLIC_URL}/images/graphic-design.jpeg`,
            userId: 3,
            username: "tnguyen",
            category: "Arts",
          },
          {
            skillId: 4,
            name: "Video Editing",
            brief: "Editing videos in Premiere Pro and Final Cut.",
            detail:
              "Master cutting, color grading, and transitions to create professional-level video projects.",
            image: `${process.env.PUBLIC_URL}/images/video-editing.jpeg`,
            userId: 4,
            username: "rpatel",
            category: "Technology",
          },
          {
            skillId: 5,
            name: "Spanish",
            brief: "Conversational and written fluency.",
            detail:
              "Improve your Spanish speaking and comprehension for travel, business, or cultural enrichment.",
            image: `${process.env.PUBLIC_URL}/images/spanish.jpg`,
            userId: 5,
            username: "mgomez",
            category: "Arts",
          },
          {
            skillId: 6,
            name: "Photography",
            brief: "Portrait and landscape photography.",
            detail:
              "Learn to capture stunning photos using natural light, composition, and post-processing techniques.",
            image: `${process.env.PUBLIC_URL}/images/photography.jpg`,
            userId: 6,
            username: "lcooper",
            category: "Sports",
          },
          {
            skillId: 7,
            name: "Web Development",
            brief: "Building with HTML, CSS, JavaScript.",
            detail:
              "Design and code responsive websites using front-end technologies and frameworks.",
            image: `${process.env.PUBLIC_URL}/images/web-development.jpg`,
            userId: 7,
            username: "dchung",
            category: "Technology",
          },
          {
            skillId: 8,
            name: "Knitting",
            brief: "Handmade scarves and crafts.",
            detail:
              "Learn knitting patterns, stitches, and techniques to make creative handwoven items.",
            image: `${process.env.PUBLIC_URL}/images/knitting.jpeg`,
            userId: 8,
            username: "eharrison",
            category: "Arts",
          },
          {
            skillId: 9,
            name: "Cooking",
            brief: "Recipe development and world cuisines.",
            detail:
              "Experiment with diverse cuisines and develop original recipes with culinary creativity.",
            image: `${process.env.PUBLIC_URL}/images/cooking.jpg`,
            userId: 9,
            username: "kross",
            category: "Public Relations",
          },
          {
            skillId: 10,
            name: "3D Modeling",
            brief: "Creating 3D assets for games and animation.",
            detail:
              "Build digital 3D models for use in animations, games, and industrial design using modern software.",
            image: `${process.env.PUBLIC_URL}/images/3d-modeling.jpeg`,
            userId: 10,
            username: "fnguyen",
            category: "Technology",
          },
          {
            skillId: 11,
            name: "Teaching",
            brief: "Experienced in classroom and online instruction.",
            detail:
              "Develop effective teaching strategies to engage learners in diverse educational settings.",
            image: `${process.env.PUBLIC_URL}/images/teaching.jpg`,
            userId: 11,
            username: "sallen",
            category: "Arts",
          },
          {
            skillId: 12,
            name: "Project Management",
            brief: "Managing teams and deadlines effectively.",
            detail:
              "Learn to plan, execute, and monitor projects efficiently using agile and traditional frameworks.",
            image: `${process.env.PUBLIC_URL}/images/project-management.jpg`,
            userId: 12,
            username: "bjackson",
            category: "Finance",
          },
        ];

        setSkills(backupSkills);
      });
  }, []);

  // array to each skill card
  //   const skills = [
  //   {
  //     id: "public-speaking",
  //     name: "Public Speaking",
  //     brief: "Confident presentations and speeches.",
  //     img: `${process.env.PUBLIC_URL}/images/public-speaking.jpg`,
  //     category: "Communication",
  //   },
  //   {
  //     id: "python",
  //     name: "Python",
  //     brief: "Programming and data analysis using Python.",
  //     img: `${process.env.PUBLIC_URL}/images/python.jpeg`,
  //     category: "Programming",
  //   },
  //   {
  //     id: "graphic-design",
  //     name: "Graphic Design",
  //     brief: "Creating visuals with Adobe Illustrator.",
  //     img: `${process.env.PUBLIC_URL}/images/graphic-design.jpeg`,
  //     category: "Design",
  //   },
  //   {
  //     id: "video-editing",
  //     name: "Video Editing",
  //     brief: "Editing videos in Premiere Pro and Final Cut.",
  //     img: `${process.env.PUBLIC_URL}/images/video-editing.jpeg`,
  //     category: "Media",
  //   },
  //   {
  //     id: "spanish",
  //     name: "Spanish",
  //     brief: "Conversational and written fluency.",
  //     img: `${process.env.PUBLIC_URL}/images/spanish.jpg`,
  //     category: "Language",
  //   },
  //   {
  //     id: "photography",
  //     name: "Photography",
  //     brief: "Portrait and landscape photography.",
  //     img: `${process.env.PUBLIC_URL}/images/photography.jpg`,
  //     category: "Media",
  //   },
  //   {
  //     id: "web-development",
  //     name: "Web Development",
  //     brief: "Building with HTML, CSS, JavaScript.",
  //     img: `${process.env.PUBLIC_URL}/images/web-development.jpg`,
  //     category: "Programming",
  //   },
  //   {
  //     id: "knitting",
  //     name: "Knitting",
  //     brief: "Handmade scarves and crafts.",
  //     img: `${process.env.PUBLIC_URL}/images/knitting.jpeg`,
  //     category: "Crafts",
  //   },
  //   {
  //     id: "cooking",
  //     name: "Cooking",
  //     brief: "Recipe development and world cuisines.",
  //     img: `${process.env.PUBLIC_URL}/images/cooking.jpg`,
  //     category: "Culinary",
  //   },
  //   {
  //     id: "3d-modeling",
  //     name: "3D Modeling",
  //     brief: "Creating 3D assets for games and animation.",
  //     img: `${process.env.PUBLIC_URL}/images/3d-modeling.jpeg`,
  //     category: "Design",
  //   },
  //   {
  //     id: "teaching",
  //     name: "Teaching",
  //     brief: "Experienced in classroom and online instruction.",
  //     img: `${process.env.PUBLIC_URL}/images/teaching.jpg`,
  //     category: "Education",
  //   },
  //   {
  //     id: "project-management",
  //     name: "Project Management",
  //     brief: "Managing teams and deadlines effectively.",
  //     img: `${process.env.PUBLIC_URL}/images/project-management.jpg`,
  //     category: "Business",
  //   },
  // ];

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
            skillId={skill.skillId}
            name={skill.name}
            brief={skill.brief}
             //inject random place holder image form the Lorem Picsum API
            skillImg={`//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`}
            category = {skill.category}
            username = {skill.username}
            ImgHeight = {skill.height}
          />
        )
         )}
      </div>
    </div>
  );
};

export default Home;
