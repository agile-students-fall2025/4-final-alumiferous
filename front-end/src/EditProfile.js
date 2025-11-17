import React, { useState, useEffect } from 'react';
import './EditProfile.css';
import './Messages.css';

const blankProfile = {
  userId: 1,
  username: '',
  profilePhoto: '/images/avatar-default.png',
  about: '',
  skillsAcquired: [],
  skillsWanted: [],
};

// Skill List Editor component ...
function SkillsEditor({ skills, onAdd, onRemove, label, tagExtraClass = '' }) {
  // (Unchanged)
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
  const [profile, setProfile] = useState(blankProfile);
  const [photoFile, setPhotoFile] = useState(null);

  // Load profile from backend on mount
  useEffect(() => {
    fetch('/api/profile/1')
      .then(res => res.json())
      .then(data => setProfile({
        userId: data.userId || blankProfile.userId,
        username: data.username || blankProfile.username,
        profilePhoto: data.profilePhoto || blankProfile.profilePhoto,
        about: data.about || blankProfile.about,
        skillsAcquired: data.skillsAcquired || blankProfile.skillsAcquired,
        skillsWanted: data.skillsWanted || blankProfile.skillsWanted
      }))
      .catch(() => setProfile(blankProfile));
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // New: Handle photo upload input and preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
  };

  const handleSave = async () => {
    if (!profile || !profile.userId) {
      alert('Profile missing userId!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('userId', profile.userId);
      formData.append('username', profile.username);
      formData.append('about', profile.about);
      formData.append('skillsAcquired', JSON.stringify(profile.skillsAcquired));
      formData.append('skillsWanted', JSON.stringify(profile.skillsWanted));
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      } else {
        formData.append('profilePhoto', profile.profilePhoto);
      }

      const res = await fetch(`/api/profile/${profile.userId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        window.history.back();
      } else {
        alert('Failed to save profile changes.');
      }
    } catch (err) {
      alert('Network error occurred.');
    }
  };

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

  if (!profile) return <div>Loading...</div>;

  return (
    <main className="edit-profile-page">
      <header className="messages-header">
        <button className="back-btn" onClick={() => window.history.back()} aria-label="Back">←</button>
      </header>
      <div className="edit-profile-content">
        <div className="ProfilePhotoSection">
  <img
    className="Avatar"
    src={
      photoFile
        ? URL.createObjectURL(photoFile)
        : profile.profilePhoto || blankProfile.profilePhoto
    }
    alt="Profile"
  />
  <input
    type="file"
    accept="image/*"
    id="profile-photo-upload"
    style={{ display: "none" }}
    onChange={handlePhotoChange}
  />
  {/* Use styled label as the button, NOT a <button> */}
  <label
    htmlFor="profile-photo-upload"
    className="UploadButton"
    tabIndex={0}
    style={{ cursor: "pointer", display: "inline-block", marginTop: 10 }}
  >
    Upload/Change Photo
  </label>
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


