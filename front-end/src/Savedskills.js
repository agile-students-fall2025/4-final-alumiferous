import React, { useContext, useState, useEffect } from "react";
import { SkillsContext } from "./SkillsContext";
import SavedSkillCard from "./SavedSkillCard";
import "./Savedskills.css";

const Savedskills = () => {
  const { skills, handleUnsaveSkill } = useContext(SkillsContext);

  // Only saved skills
  const savedSkills = skills.filter(skill => skill.saved);

  // Search and filtered states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSaved, setFilteredSaved] = useState(savedSkills);
  const [isSearching, setIsSearching] = useState(false);

  // Update filtered list when savedSkills changes
  useEffect(() => {
    setFilteredSaved(savedSkills);
  }, [savedSkills.length]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setFilteredSaved(savedSkills);
      setIsSearching(false);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const filtered = savedSkills.filter(
      skill =>
        skill.name.toLowerCase().includes(lower) ||
        skill.brief.toLowerCase().includes(lower) ||
        skill.category.toLowerCase().includes(lower) ||
        skill.username.toLowerCase().includes(lower)
    );

    setFilteredSaved(filtered);
  }, [searchTerm, savedSkills]);

  return (
    <div className="savedskills-page">
      <header className="savedskills-header">
        <h2 className="savedskills-title">Your Saved Skills</h2>
      </header>

      <input
        type="text"
        placeholder="Search your saved skills (min 3 characters)"
        className="savedskills-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isSearching && <p className="savedskills-status">Searching...</p>}

      {!isSearching && filteredSaved.length === 0 ? (
        <p className="savedskills-status">No saved skills found.</p>
      ) : (
        <div className="savedskills-grid">
          {filteredSaved.map((skill, i) => (
            <SavedSkillCard
              key={i}
              skill={skill}
              onUnsave={() => handleUnsaveSkill(skill.skillId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Savedskills;
