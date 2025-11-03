import React, { useContext, useState, useEffect } from "react";
import { SkillsContext } from "./SkillsContext";
import Skill from "./Skill";
import "./Savedskills.css";

const Savedskills = () => {
  const { skills } = useContext(SkillsContext);

  // Filter only saved skills
  const savedSkills = skills.filter(skill => skill.saved);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSavedSkills, setFilteredSavedSkills] = useState(savedSkills);
  const [isSearching, setIsSearching] = useState(false);

  // Update filtered list when skills or saved ones change
  useEffect(() => {
    setFilteredSavedSkills(savedSkills);
  }, [skills]);

  // Handle search with local filtering (same as in Home)
  useEffect(() => {
    if (searchTerm.length < 3) {
      setFilteredSavedSkills(savedSkills);
      setIsSearching(false);
      return;
    }

    const filtered = savedSkills.filter(skill => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        skill.name.toLowerCase().includes(lowerSearch) ||
        skill.brief.toLowerCase().includes(lowerSearch) ||
        skill.category.toLowerCase().includes(lowerSearch) ||
        skill.username.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredSavedSkills(filtered);
  }, [searchTerm, savedSkills]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="savedskills-container">
      <header className="page-title">
        <h2>Saved Skills</h2>
      </header>

      <input
        className="saved-search-box"
        type="text"
        placeholder="Search your saved skills (min 3 characters)"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {isSearching && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Searching...</p>
        </div>
      )}

      {!isSearching &&
        filteredSavedSkills.length === 0 &&
        searchTerm.length >= 3 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>No saved skills found matching "{searchTerm}"</p>
          </div>
        )}

      <div className="skill-grid">
        {!isSearching &&
          filteredSavedSkills.map((skill, i) => (
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
          ))}
      </div>
    </div>
  );
};

export default Savedskills;
