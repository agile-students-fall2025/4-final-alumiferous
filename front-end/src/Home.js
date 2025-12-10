import React, { useContext, useState, useEffect } from "react";
import Skill from "./Skill";
import { SkillsContext } from "./SkillsContext";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
// import { searchSkills } from "./api/skillsApi"; // Uncomment when backend is ready

const Home = () => {
  //import the already fetched data from skill context
  const { skills } = useContext(SkillsContext);

  // State for search input and filtered skills
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for category filter
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Skills");
  
  // State for sort option
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, az

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/fixeddata');
        if (res.ok) {
          const data = await res.json();
          const cats = Array.isArray(data.categories) ? data.categories : [];
          setCategories(cats.sort());
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Filter out hidden skills and initialize filteredSkills
  const visibleSkills = React.useMemo(() => {
    return skills.filter(skill => !skill.hidden);
  }, [skills]);

  // Apply category filter, search, and sorting
  useEffect(() => {
    let result = [...visibleSkills];
    
    // 1. Apply category filter
    if (selectedCategory !== "All Skills") {
      result = result.filter(skill => {
        const skillCats = skill.categories || [];
        return skillCats.some(cat => cat === selectedCategory);
      });
    }
    
    // 2. Apply search filter (only if 3+ characters)
    if (searchTerm.length >= 3) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((skill) => {
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
    }
    
    // 3. Apply sorting
    if (sortBy === "recent") {
      // Most recent first - sort by createdAt if available, otherwise by skillId
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Fallback: MongoDB ObjectIds contain timestamp, so higher ID = more recent
        const aId = a.skillId || a.id || '';
        const bId = b.skillId || b.id || '';
        return bId.localeCompare(aId);
      });
    } else if (sortBy === "popular") {
      // Most popular - for now, use random-ish order based on skillId hash
      // TODO: Add proper view/request count tracking in the future
      result.sort((a, b) => {
        // Use a simple hash of the ID to create consistent but "random" popularity
        const hashId = (id) => {
          let hash = 0;
          for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash;
          }
          return Math.abs(hash);
        };
        const aId = a.skillId || a.id || '';
        const bId = b.skillId || b.id || '';
        return hashId(bId) - hashId(aId);
      });
    } else if (sortBy === "az") {
      // Alphabetical A-Z
      result.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
    
    setFilteredSkills(result);
  }, [searchTerm, visibleSkills, selectedCategory, sortBy]);

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
          className="search-input block mx-auto mb-4"
          placeholder="Search for skills to learn..." 
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyUp={handleSearchChange}
        />
        
        {/* Filter and Sort Dropdowns */}
        <div className="flex gap-3 justify-center max-w-md mx-auto">
          {/* Category Filter */}
          <div className="relative flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All Skills">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
          
          {/* Sort Filter */}
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="recent">Recently Added</option>
              <option value="popular">Most Popular</option>
              <option value="az">A-Z</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>
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
