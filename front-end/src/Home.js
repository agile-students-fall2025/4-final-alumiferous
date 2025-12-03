import React, { useContext, useState, useEffect } from "react";
import Skill from "./Skill";
import { SkillsContext } from "./SkillsContext";
// import { searchSkills } from "./api/skillsApi"; // Uncomment when backend is ready

const Home = () => {
  //import the already fetched data from skill context
  const { skills } = useContext(SkillsContext);

  // State for search input and filtered skills
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter out hidden skills and initialize filteredSkills
  const visibleSkills = React.useMemo(() => {
    return skills.filter(skill => !skill.hidden);
  }, [skills]);

  // Initialize filteredSkills with visible skills
  useEffect(() => {
    setFilteredSkills(visibleSkills);
  }, [visibleSkills]);

  // Handle search with debouncing - only search when 3+ characters
  useEffect(() => {
    // If search term is less than 3 characters, show all visible skills
    if (searchTerm.length < 3) {
      setFilteredSkills(visibleSkills);
      setIsSearching(false);
      return;
    }

    // LOCAL FILTERING (current implementation)
    // Remove this block when backend is ready
    const filtered = visibleSkills.filter((skill) => {
      const lowerSearch = searchTerm.toLowerCase();
      
      // Check if categories array includes the search term
      const categoryMatch = skill.categories && Array.isArray(skill.categories) 
        ? skill.categories.some(cat => cat && cat.toLowerCase().includes(lowerSearch))
        : false;
      
      return (
        (skill.name && skill.name.toLowerCase().includes(lowerSearch)) ||
        (skill.brief && skill.brief.toLowerCase().includes(lowerSearch)) ||
        categoryMatch ||
        (skill.username && skill.username.toLowerCase().includes(lowerSearch))
      );
    });
    setFilteredSkills(filtered);

  }, [searchTerm, visibleSkills]);

  // Handle input change on keyup
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  //return all list components by looping through the array of skills

  return (
    <div className="mt-[calc(65px+0.5rem)] p-4 pb-20 bg-[#f8f9fb] dark:bg-[#121212]">
      <header className="text-center mb-6">
        <input 
          type="text" 
          className="search-input block mx-auto"
          placeholder="Search a skill (min 3 characters)" 
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyUp={handleSearchChange}
        />
      </header>

      {isSearching && (
        <div className="text-center p-5">
          <p>Searching...</p>
        </div>
      )}

      {!isSearching &&
        filteredSkills.length === 0 &&
        searchTerm.length >= 3 && (
          <div className="text-center p-5">
            <p>No skills found matching "{searchTerm}"</p>
          </div>
        )}

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 max-w-full mx-auto">
        {!isSearching &&
          filteredSkills.map((skill, i) => (
            <Skill //pass skill details as attributes to
              key={i}
              skillId={skill.skillId}
              name={skill.name}
              brief={skill.brief}
              // Use the image provided by the backend only
              image={skill.image}
              category={skill.categories}
              username={skill.username}
              ImgHeight={skill.height}
            />
          ))}
      </div>
    </div>
  );
};

export default Home;
