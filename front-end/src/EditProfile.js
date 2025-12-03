import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const blankProfile = {
  userId: 1,
  username: '',
  firstName: '',
  lastName: '',
  profilePhoto: '/images/avatar-default.png',
  bio: '',
  skillsOffered: [],
  skillsWanted: [],
};

// Skill List Editor component
function SkillsEditor({ skills, onAdd, onRemove, label }) {
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
    <div className="w-full max-w-[540px] mb-5">
      <h3 className="text-lg font-bold text-black dark:text-[#f1f1f1] mb-2 text-center">{label}</h3>
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {skills.map((skill, i) => (
          <div className="flex items-center gap-2" key={i}>
            <span className="py-3 px-[17px] rounded-[18px] bg-primary text-white font-semibold shadow-[0_2.5px_13px_rgba(40,120,220,0.10)] dark:shadow-[0_2.5px_13px_rgba(77,171,247,0.2)] text-[15px] tracking-[0.01em] whitespace-nowrap">
              {skill}
            </span>
            <button
              className="w-5 h-5 min-w-[20px] min-h-[20px] rounded-full bg-[#dc3545] text-white border-none text-sm font-bold cursor-pointer inline-flex items-center justify-center leading-none p-0 transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.15)] shrink-0 hover:bg-[#c82333] hover:scale-110 active:scale-95"
              onClick={() => {
                if (window.confirm(`Remove "${skill}"?`)) onRemove(skill);
              }}
              aria-label={`Remove ${skill}`}
            >×</button>
          </div>
        ))}
      </div>
      {showAdd ? (
        <form
          className="flex gap-2 justify-center mt-3"
          onSubmit={e => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <input
            className="w-full max-w-[300px] py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] bg-white dark:bg-[#2b2b2b] dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Type new skill"
            autoFocus
            aria-label="New Skill"
          />
          <button type="submit" className="btn btn-primary px-4">Add</button>
          <button type="button" className="btn px-4" onClick={() => setShowAdd(false)}>Cancel</button>
        </form>
      ) : (
        <div className="text-center">
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Skill +</button>
        </div>
      )}
    </div>
  );
}

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(blankProfile);
  const [photoFile, setPhotoFile] = useState(null);

  // Load profile from backend on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || localStorage.getItem('currentUserId') || '1';
    fetch(`/api/profile/${storedUserId}`)
      .then(res => res.json())
      .then(data => setProfile({
        userId: data._id || data.userId || blankProfile.userId,
        username: data.username || blankProfile.username,
        firstName: data.firstName || blankProfile.firstName,
        lastName: data.lastName || blankProfile.lastName,
        profilePhoto: data.avatarURL || data.profilePhoto || blankProfile.profilePhoto,
        bio: data.bio || blankProfile.bio,
        skillsOffered: data.skillsOffered || blankProfile.skillsOffered,
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
      formData.append('username', profile.username || '');
      formData.append('firstName', profile.firstName || '');
      formData.append('lastName', profile.lastName || '');
      formData.append('bio', profile.bio || '');
      formData.append('skillsOffered', JSON.stringify(profile.skillsOffered));
      formData.append('skillsWanted', JSON.stringify(profile.skillsWanted));
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      }

      const res = await fetch(`/api/profile/${profile.userId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        navigate('/profile');
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

  if (!profile) return <main className="flex items-center justify-center min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">Loading...</main>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-screen max-w-[600px] bg-white dark:bg-[#121212] overflow-hidden p-0 pt-[65px] pb-20 mx-auto">
      {/* Header */}
      <div className="fixed top-[65px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen">
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
          onClick={() => navigate('/profile')} 
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 text-center">Edit Profile</h1>
        <button
          className="bg-transparent border-none text-base text-primary dark:text-[#4dabf7] font-semibold cursor-pointer"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
      
      <div className="w-full flex flex-col items-center pt-6 px-4">
        {/* Profile Photo */}
        <img
          className="w-[104px] h-[104px] rounded-full object-cover shadow-[0_2px_12px_rgba(33,89,135,0.11)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border-4 border-[#e6f0ff] dark:border-[#2b2b2b] mb-3"
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
          className="hidden"
          onChange={handlePhotoChange}
        />
        <label
          htmlFor="profile-photo-upload"
          className="cursor-pointer inline-block mt-2 mb-6 bg-primary text-white border-none rounded-app py-3 px-6 font-semibold hover:bg-primary-hover transition-colors"
          tabIndex={0}
        >
          Change Photo
        </label>

        {/* Name Fields */}
        <div className="w-full max-w-[540px] mb-4 flex flex-col items-center">
          <input
            className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] mb-2 dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            value={profile.firstName || ""}
            onChange={e => handleChange("firstName", e.target.value)}
            placeholder="First Name"
          />
          <input
            className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] mb-2 dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            value={profile.lastName || ""}
            onChange={e => handleChange("lastName", e.target.value)}
            placeholder="Last Name"
          />
          <input
            className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            value={profile.username || ""}
            onChange={e => handleChange("username", e.target.value)}
            placeholder="Username"
          />
        </div>

        {/* About Section */}
        <div className="w-full max-w-[540px] my-4 flex flex-col items-center">
          <div className="text-[1.16rem] font-bold text-black dark:text-[#f1f1f1] mb-2 text-center">About</div>
          <textarea
            value={profile.bio || ""}
            onChange={e => handleChange("bio", e.target.value)}
            className="w-[96%] max-w-[520px] min-h-[100px] py-4 px-4 rounded-[13px] bg-white dark:bg-[#2b2b2b] border-[1.5px] border-[#cbcbcb] dark:border-[#444] text-[#313741] dark:text-[#f1f1f1] text-[1.13rem] shadow-[0_1px_5px_rgba(255,255,255,0.06)] dark:shadow-[0_1px_5px_rgba(0,0,0,0.3)] resize-y focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Skills Offered */}
        <SkillsEditor
          skills={profile.skillsOffered}
          onAdd={skill => addSkill('skillsOffered', skill)}
          onRemove={skill => removeSkill('skillsOffered', skill)}
          label="Skills Offered"
        />

        {/* Skills Wanted */}
        <SkillsEditor
          skills={profile.skillsWanted}
          onAdd={skill => addSkill('skillsWanted', skill)}
          onRemove={skill => removeSkill('skillsWanted', skill)}
          label="Skills Wanted"
        />
      </div>
    </main>
  );
};

export default EditProfile;