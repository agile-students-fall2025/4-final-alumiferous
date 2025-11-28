import React, { useContext, useState, useEffect } from "react";
import axios from 'axios';
import { SkillsContext } from "./SkillsContext";
import SavedSkillCard from "./SavedSkillCard";
import "./Savedskills.css";

const Savedskills = () => {
  const { handleUnsaveSkill, skills, savedIds } = useContext(SkillsContext);

  // Search and filtered states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSaved, setFilteredSaved] = useState([]);
  const [savedSkills, setSavedSkills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const currentUserId = localStorage.getItem('currentUserId');

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleUnsave = (skillId) => {
    handleUnsaveSkill(skillId);
    // Also update local saved list
    setSavedSkills((prev) => prev.filter(s => s.skillId !== skillId));
    showNotification('Skill Unsaved', 'success');
  };

  const handleReport = () => {
    showNotification('Issue Reported', 'info');
  };

  // Fetch current user's saved skills from server; fallback to empty
  const fetchSaved = async () => {
    if (!currentUserId) {
      // No logged-in user: build saved list locally from savedIds + skills
      const localSaved = savedIds && savedIds.length > 0
        ? skills.filter(s => savedIds.includes(s.skillId))
        : [];
      setSavedSkills(localSaved);
      return;
    }
    try {
      const res = await axios.get(`/api/users/${currentUserId}/saved`);
      const data = res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setSavedSkills(data);
      } else {
        // If server returned empty, fall back to local savedIds
        const localSaved = savedIds && savedIds.length > 0
          ? skills.filter(s => savedIds.includes(s.skillId))
          : [];
        setSavedSkills(localSaved);
      }
    } catch (err) {
      console.error('Failed to load saved skills:', err);
      const localSaved = savedIds && savedIds.length > 0
        ? skills.filter(s => savedIds.includes(s.skillId))
        : [];
      setSavedSkills(localSaved);
    }
  };

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

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
        (skill.name || '').toLowerCase().includes(lower) ||
        (skill.brief || '').toLowerCase().includes(lower) ||
        (skill.category || '').toLowerCase().includes(lower) ||
        (skill.username || '').toLowerCase().includes(lower)
    );

    setFilteredSaved(filtered);
  }, [searchTerm, savedSkills]);

  return (
    <div className="savedskills-page">
      <header className="savedskills-header">
        <h2 className="savedskills-title">Saved</h2>
      </header>

      <div className="savedskills-content">
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
      </div>

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