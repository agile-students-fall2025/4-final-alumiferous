import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

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
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill, i) => (
          <span
            tabIndex={0}
            key={i}
            className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all ${
              tagExtraClass === 'wanted' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
            }`}
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
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <input
            className="form-input flex-1"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Type new skill"
            autoFocus
            aria-label="New Skill"
          />
          <button type="submit" className="btn btn-primary">Add</button>
          <button
            type="button"
            className="btn"
            onClick={() => setShowAdd(false)}
          >Cancel</button>
        </form>
      ) : (
        <button
          type="button"
          className="btn"
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
    <main className="min-h-screen bg-white dark:bg-[#121212] pt-[65px]">
      <header className="fixed top-[65px] left-0 right-0 z-10 flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => window.history.back()} aria-label="Back">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h1>
      </header>
      <div className="px-4 py-6 pt-[72px] pb-20 max-w-2xl mx-auto">
        <div className="card mb-6">
          <div className="flex flex-col items-center mb-6">
            <img
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200 dark:border-gray-700"
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
            <label
              htmlFor="profile-photo-upload"
              className="btn btn-primary cursor-pointer"
              tabIndex={0}
            >
              Upload/Change Photo
            </label>
          </div>
          <div className="mb-6">
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About Me:</label>
            <textarea
              id="about"
              className="form-input min-h-[120px]"
              maxLength={500}
              value={profile.about}
              onChange={e => handleChange('about', e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="mb-6">
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
          <button className="btn btn-primary w-full" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </main>
  );
};

export default EditProfile;


