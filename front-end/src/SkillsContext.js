import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SkillsContext = createContext();

export const SkillsProvider = ({ children }) => {
   //a state variable with a blank array
  const [skills, setSkills] = useState([]);
  
  // Fetch or load cached data once when app starts
  useEffect(() => {
    //create a local storage to prevent unneccesary API calls
    const cached = localStorage.getItem("skills");
    //if there is cached data use it as the skills data and return
    if (cached) {
      setSkills(JSON.parse(cached));
      return; // skip the API call
    }

    //fetch data from mock API
    console.log("fetching skill details...");
    axios("https://my.api.mockaroo.com/skills.json?key=4e009220")
    //callback to be returned when the call is successful
      .then(response => {
        
        //update the data fected with the image ratio
        const updatedData = response.data.map(skill => ({
          ...skill,
          width: Math.floor(Math.random() * 80) + 150,
          height: Math.floor(Math.random() * 100) + 200,
          saved: false,
          hidden: false,
        }));
        setSkills(updatedData); //set skills data to updated data
        localStorage.setItem("skills", JSON.stringify(updatedData)); //set the newly fected data to local storage
      })
      .catch(err => {
        //incase mockaroo API call fails
        console.error("Mock API call failed:", err);

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
        setSkills(backupSkills); //set backup data
      });
  }, []);

  // Handle saving skills
  const handleSaveSkill = id => {
    const updatedSkills = skills.map(skill =>
      skill.skillId === id ? { ...skill, saved: true } : skill
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  // Handle unsaving skills
  const handleUnsaveSkill = id => {
    const updatedSkills = skills.map(skill =>
      skill.skillId === id ? { ...skill, saved: false } : skill
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  // Handle hiding skills
  const handleHideSkill = id => {
    const updatedSkills = skills.map(skill =>
      skill.skillId === id ? { ...skill, hidden: true } : skill
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  // Handle unhiding skills
  const handleUnhideSkill = id => {
    const updatedSkills = skills.map(skill =>
      skill.skillId === id ? { ...skill, hidden: false } : skill
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  return (
    <SkillsContext.Provider value={{ skills, handleSaveSkill, handleUnsaveSkill, handleHideSkill, handleUnhideSkill }}>
      {children}
    </SkillsContext.Provider>
  );
};
