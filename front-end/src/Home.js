import React, { useContext, useState, useEffect, useRef } from "react";
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
  
  // State for category filter
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Skills");
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  // State for sort option
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, az
  const [sortOpen, setSortOpen] = useState(false);
  
  // Refs for click-away
  const categoryRef = useRef(null);
  const sortRef = useRef(null);

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
    
    // Click-away listener for dropdowns
    function onDocClick(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('click', onDocClick);
    };
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
          <div className="relative flex-1" ref={categoryRef}>
            <button
              type="button"
              className="form-input w-full text-left"
              onClick={() => setCategoryOpen(!categoryOpen)}
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
            >
              {selectedCategory}
            </button>
            {categoryOpen && (
              <div className="absolute z-40 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#333] rounded-app shadow-lg max-h-56 overflow-y-auto w-full mt-1.5 p-2" style={{ maxHeight: 220 }}>
                <div
                  className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm text-left text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setSelectedCategory("All Skills");
                    setCategoryOpen(false);
                  }}
                >
                  All Categories
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm text-left text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Filter */}
          <div className="relative flex-1" ref={sortRef}>
            <button
              type="button"
              className="form-input w-full text-left"
              onClick={() => setSortOpen(!sortOpen)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              {sortBy === "recent" ? "Recently Added" : sortBy === "popular" ? "Most Popular" : "A-Z"}
            </button>
            {sortOpen && (
              <div className="absolute z-40 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#333] rounded-app shadow-lg max-h-56 overflow-y-auto w-full mt-1.5 p-2" style={{ maxHeight: 220 }}>
                <div
                  className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm text-left text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setSortBy("recent");
                    setSortOpen(false);
                  }}
                >
                  Recently Added
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm text-left text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setSortBy("popular");
                    setSortOpen(false);
                  }}
                >
                  Most Popular
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm text-left text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setSortBy("az");
                    setSortOpen(false);
                  }}
                >
                  A-Z
                </div>
              </div>
            )}
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
