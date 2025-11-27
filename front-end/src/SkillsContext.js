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

    // Fetch data from Mockaroo API
    const fetchSkills = async () => {
      try {
        console.log("Fetching skill details from backend...");
        const res = await axios.get('http://localhost:4000/api/skills');


        setSkills(res.data);
        localStorage.setItem("skills", JSON.stringify(res.data));
      } catch (err) {
        console.error("Backend fetch failed:", err);
      }
    };

    fetchSkills();
  }, []);

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

  const addNewSkill = (newSkill) => {
    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    localStorage.setItem("skills", JSON.stringify(updatedSkills));
  };

  const refreshSkills = async () => {
    try {
      console.log("Refreshing skills from backend...");
      const res = await axios.get('http://localhost:4000/api/skills');
      setSkills(res.data);
      localStorage.setItem("skills", JSON.stringify(res.data));
    } catch (err) {
      console.error("Backend refresh failed:", err);
    }
  };

  return (
    <SkillsContext.Provider
      value={{
        skills,
        handleSaveSkill,
        handleUnsaveSkill,
        handleHideSkill,
        handleUnhideSkill,
        addNewSkill,
        refreshSkills,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
};