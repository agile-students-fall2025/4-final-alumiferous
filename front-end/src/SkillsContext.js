import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SkillsContext = createContext();

export const SkillsProvider = ({ children }) => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const cached = localStorage.getItem("skills");

    if (cached) {
      setSkills(JSON.parse(cached));
      return; // Skip API call if cached
    }

    // Load API key from .env file
    const apiKey = process.env.REACT_APP_MOCKAROO_KEY;

    if (!apiKey) {
      console.error("❌ Missing REACT_APP_MOCKAROO_KEY environment variable");
      loadBackupSkills();
      return;
    }

    // Fetch data from Mockaroo API
    const fetchSkills = async () => {
      try {
        console.log("Fetching skill details from Mockaroo...");
        const response = await axios.get(`https://my.api.mockaroo.com/skills.json?key=${apiKey}`);

        const updatedData = response.data.map((skill) => ({
          ...skill,
          width: Math.floor(Math.random() * 80) + 150,
          height: Math.floor(Math.random() * 100) + 200,
          saved: false,
          hidden: false,
        }));

        setSkills(updatedData);
        localStorage.setItem("skills", JSON.stringify(updatedData));
      } catch (err) {
        console.error("Mock API call failed:", err);
        loadBackupSkills();
      }
    };

    fetchSkills();
  }, []);

  /** Fallback skill data for offline or API failure **/
  const loadBackupSkills = () => {
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
    ];
    setSkills(backupSkills);
    localStorage.setItem("skills", JSON.stringify(backupSkills));
  };

  /*** Action handlers ***/
  const handleSaveSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, saved: true } : s
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  const handleUnsaveSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, saved: false } : s
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  const handleHideSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, hidden: true } : s
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  const handleUnhideSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, hidden: false } : s
    );
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  return (
    <SkillsContext.Provider
      value={{
        skills,
        handleSaveSkill,
        handleUnsaveSkill,
        handleHideSkill,
        handleUnhideSkill,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
};