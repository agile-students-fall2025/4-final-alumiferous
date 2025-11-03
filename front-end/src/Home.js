import React, { useContext, useState, useEffect } from "react";
import "./Home.css";
import Skill from "./Skill";
import { SkillsContext } from "./SkillsContext";
// import { searchSkills } from "./api/skillsApi"; // Uncomment when backend is ready

const Home = () => {
  //import the already fetched data from skill context
  const { skills, handleSaveSkill } = useContext(SkillsContext);

  // State for search input and filtered skills
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize filteredSkills with all skills
  useEffect(() => {
    setFilteredSkills(skills);
  }, [skills]);

  // Handle search with debouncing - only search when 3+ characters
  useEffect(() => {
    // If search term is less than 3 characters, show all skills
    if (searchTerm.length < 3) {
      setFilteredSkills(skills);
      setIsSearching(false);
      return;
    }

    // LOCAL FILTERING (current implementation)
    // Remove this block when backend is ready
    const filtered = skills.filter((skill) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        skill.name.toLowerCase().includes(lowerSearch) ||
        skill.brief.toLowerCase().includes(lowerSearch) ||
        skill.category.toLowerCase().includes(lowerSearch) ||
        skill.username.toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredSkills(filtered);

    // BACKEND FILTERING (uncomment when backend is ready)
    /*
    setIsSearching(true);
    searchSkills(searchTerm)
      .then((results) => {
        setFilteredSkills(results);
        setIsSearching(false);
      })
      .catch((error) => {
        console.error("Search error:", error);
        setIsSearching(false);
        // Fallback to showing all skills on error
        setFilteredSkills(skills);
      });
    */
  }, [searchTerm, skills]);

  // Handle input change on keyup
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  //return all list components by looping through the array of skills
  
  return (
    
    <div className="home-container">
      <header className="home-header">
        <input 
          type="text" 
          className="search-input"
          placeholder="Search a skill (min 3 characters)" 
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyUp={handleSearchChange}
        />
      </header>

      {isSearching && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Searching...</p>
        </div>
      )}

      {!isSearching && filteredSkills.length === 0 && searchTerm.length >= 3 && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>No skills found matching "{searchTerm}"</p>
        </div>
      )}

      <div className="skill-grid">
        {!isSearching && filteredSkills.map((skill, i) => (
         
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
            handleSaveSkill = {handleSaveSkill}
          />
        )
         )}
      </div>
    </div>
  );
};

export default Home;
