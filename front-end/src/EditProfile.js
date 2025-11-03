import React, { useState } from 'react';
import './EditProfile.css';
import './Messages.css';

// Skill List Editor component
function SkillsEditor({ skills, onAdd, onRemove, label, tagExtraClass = '' }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = () => {
    if (newSkill.trim()) {
      onAdd(newSkill.trim());
      setNewSkill('');
      setShowAdd(false);
    }
  };

  return (
    <div className="SkillsEditor">
      <h4 className="SkillsLabel">{label}</h4>
      <div className="SkillsTags">
        {skills.map((skill, i) => (
          <span
            tabIndex={0}
            key={i}
            className={`SkillTag ${tagExtraClass}`}
            title="Click to remove"
            onClick={() => {
              if (window.confirm(`Remove "${skill}"?`)) onRemove(skill);
            }}
            onKeyUp={e => {
              if (e.key === 'Enter' && window.confirm(`Remove "${skill}"?`)) onRemove(skill);
            }}
            role="button"
            aria-label={`Remove ${skill}`}
          >
            {skill}
          </span>
        ))}
      </div>
      {showAdd ? (
        <form
          className="AddSkillForm"
          onSubmit={e => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <input
            className="AddSkillInput"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Type new skill"
            autoFocus
            aria-label="New Skill"
          />
          <button type="submit" className="AddSkillButton">Add</button>
          <button
            type="button"
            className="AddSkillButton"
            onClick={() => setShowAdd(false)}
          >Cancel</button>
        </form>
      ) : (
        <button
          type="button"
          className="AddSkillButton"
          onClick={() => setShowAdd(true)}
        >Add Skill +</button>
      )}
    </div>
  );
}

const EditProfile = () => {
  const getInitialProfile = () => {
    const stored = localStorage.getItem('profile');
    if (stored) return JSON.parse(stored);
    return {
      username: '',
      profilePhoto: '/images/avatar-default.png',
      about: '',
      skillsAcquired: [],
      skillsWanted: []
    };
  };

  const [profile, setProfile] = useState(getInitialProfile());

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save handler
  const handleSave = () => {
    localStorage.setItem('profile', JSON.stringify(profile));
    window.history.back();
  };

  // Skill change handlers
  const addSkill = (type, skill) => {
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], skill]
    }));
  };
  const removeSkill = (type, skill) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s !== skill)
    }));
  };

  return (
    <main className="edit-profile-page">
      <header className="messages-header">
        <button className="back-btn" onClick={() => window.history.back()} aria-label="Back">←</button>
      </header>
      <div className="edit-profile-content">
        <div className="ProfilePhotoSection">
          <img className="Avatar" src={profile.profilePhoto} alt="Profile" />
          <button
            className="UploadButton"
            onClick={() => alert('Upload photo clicked')}
          >
            Upload/Change Photo
          </button>
        </div>
        <div className="AboutSection">
          <label htmlFor="about">About Me:</label>
          <textarea
            id="about"
            className="form-input"
            maxLength={500}
            value={profile.about}
            onChange={e => handleChange('about', e.target.value)}
          />
        </div>
        <div className="SkillsSection">
          <SkillsEditor
            skills={profile.skillsAcquired}
            onAdd={skill => addSkill('skillsAcquired', skill)}
            onRemove={skill => removeSkill('skillsAcquired', skill)}
            label="Skills Offered:"
          />
          <SkillsEditor
            skills={profile.skillsWanted}
            onAdd={skill => addSkill('skillsWanted', skill)}
            onRemove={skill => removeSkill('skillsWanted', skill)}
            label="Skills Wanted:"
            tagExtraClass="wanted"
          />
        </div>
        <button className="SaveButton" onClick={handleSave}>Save Changes</button>
      </div>
    </main>
  );
};

export default EditProfile;

