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
        const res = await axios.get('https://localhost:4000/api/skills');


        setSkills(res.data);
        localStorage.setItem("skills", JSON.stringify(res.data));
      } catch (err) {
        console.error("Backend fetch failed:", err);
      }
    };
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