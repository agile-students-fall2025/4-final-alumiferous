import React, { useContext, useState, useEffect } from "react";
import { SkillsContext } from "./SkillsContext";
import SavedSkillCard from "./SavedSkillCard";
import "./Savedskills.css";

const Savedskills = () => {
  const { skills, handleUnsaveSkill } = useContext(SkillsContext);

  // Search and filtered states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSaved, setFilteredSaved] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Only saved skills - memoize to prevent recalculation
  const savedSkills = React.useMemo(() => {
    return skills.filter(skill => skill.saved);
  }, [skills]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleUnsave = (skillId) => {
    handleUnsaveSkill(skillId);
    showNotification('Skill Unsaved', 'success');
  };

  const handleReport = () => {
    showNotification('Issue Reported', 'info');
  };

  // Update filtered list when savedSkills or search term changes
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
              onUnsave={handleUnsave}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* Notification toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Savedskills;