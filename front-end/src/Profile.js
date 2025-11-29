import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillsContext } from './SkillsContext';
import './Profile.css';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const { skills } = useContext(SkillsContext);

  useEffect(() => {
    fetch('/api/profile/691d0ed8081ddc1c4a66116d')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFormState({ ...data });
        setPhotoFile(null);
      });
  }, []);

  // Restore edit mode after reload
  useEffect(() => {
    const editMode = sessionStorage.getItem('profileEditMode');
    if (editMode === 'true') {
      setIsEditing(true);
      sessionStorage.removeItem('profileEditMode');
    }
  }, []);

  const handleEditToggle = () => setIsEditing(prev => !prev);

  const handleChange = (field, value) =>
    setFormState(s => ({ ...s, [field]: value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('username', formState.username || '');
    formData.append('firstName', formState.firstName || '');
    formData.append('lastName', formState.lastName || '');
    formData.append('bio', formState.bio || '');
    formData.append('skillsOffered', JSON.stringify(formState.skillsOffered || []));
    formData.append('skillsWanted', JSON.stringify(formState.skillsWanted || []));
    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    }
    const res = await fetch(`/api/profile/${user._id}`, {
      method: 'PUT',
      body: formData
    });
    if (res.ok) {
      // After saving, refetch for fresh data
      const updated = await fetch(`/api/profile/${user._id}`).then(r => r.json());
      setUser(updated);
      setFormState(updated);
      setPhotoFile(null);
      setIsEditing(false);
    } else {
      alert('Failed to save profile changes');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      // Delete from userSkills (uploaded skills)
      const userSkillsCache = JSON.parse(localStorage.getItem('userSkills') || '[]');
      const updatedUserSkills = userSkillsCache.filter(s => {
        const sId = s.skillId || s.id;
        return String(sId) !== String(skillId);
      });
      localStorage.setItem('userSkills', JSON.stringify(updatedUserSkills));
      
      // Also delete from skills cache if it exists there
      const cachedSkills = JSON.parse(localStorage.getItem('skills') || '[]');
      const updatedSkills = cachedSkills.filter(s => {
        const sId = s.skillId || s.id;
        return String(sId) !== String(skillId);
      });
      localStorage.setItem('skills', JSON.stringify(updatedSkills));
      
      // Keep edit mode active
      sessionStorage.setItem('profileEditMode', 'true');
      
      // Reload to update the UI but stay in edit mode
      window.location.reload();
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert(`Error deleting skill: ${err.message}`);
    }
  };

  const confirmDelete = (skill, e) => {
    e.stopPropagation();
    setSkillToDelete(skill);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (skillToDelete) {
      handleDeleteSkill(skillToDelete.skillId || skillToDelete.id);
      setShowDeleteModal(false);
      setSkillToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSkillToDelete(null);
  };

  if (!user) return <main>Loading...</main>;

  // Get user skills from localStorage (skills created by this user)
  const userCreatedSkills = JSON.parse(localStorage.getItem('userSkills') || '[]');
  
  // Also filter from context if needed
  const contextUserSkills = skills.filter(skill => String(skill.userId) === String(user._id));
  
  // Combine both sources, removing duplicates by id
  const allUserSkills = [...userCreatedSkills];
  contextUserSkills.forEach(skill => {
    if (!allUserSkills.find(s => s.id === skill.id || s.skillId === skill.skillId)) {
      allUserSkills.push(skill);
    }
  });
  
  const userSkills = allUserSkills;

  return (
    <main>
      <div className="ProfileContent">
        <div className="ProfileHeader">
          <h1 className="ProfileTitle">Profile</h1>
          <button
            className="EditButton"
            onClick={isEditing ? handleSave : handleEditToggle}
            title={isEditing ? "Save Profile" : "Edit Profile"}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {isEditing ? "Save" : <PencilSquareIcon style={{ width: 22, height: 22 }} />}
          </button>
        </div>
          <img
            className="Avatar"
            src={
              isEditing && photoFile
                ? URL.createObjectURL(photoFile)
                : user.avatarURL || "/images/avatar-default.png"
            }
            alt="Avatar"
          />
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                id="profile-photo-upload"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              <label
                htmlFor="profile-photo-upload"
                className="UploadButton"
                tabIndex={0}
                style={{ cursor: "pointer", display: "inline-block", marginTop: 10 }}
              >
                Upload/Change Photo
              </label>
            </>
          )}
        <div className="UserInfo">
          {isEditing ? (
            <>
            <input
              className="ProfileUsernameInput"
              value={formState.firstName || ""}
              onChange={e => handleChange("firstName", e.target.value)}
              placeholder="First Name"
            />
            <input
              className="ProfileUsernameInput"
              value={formState.lastName || ""}
              onChange={e => handleChange("lastName", e.target.value)}
              placeholder="Last Name"
              style={{ marginTop: 8 }}
            />
            <input
              className="ProfileUsernameInput"
              value={formState.username || ""}
              onChange={e => handleChange("username", e.target.value)}
              placeholder="Username"
              style={{ marginTop: 8 }}
            />
            </>
          ) : (
            <>
              <h2 className="ProfileFullName">
                {user.firstName} {user.lastName}
              </h2>
              <div className="ProfileUsername">
                @{user.username}
              </div>
            </>
          )}
        </div>

        <div className="AboutSection">
          <div className="AboutLabel">About</div>
          {isEditing ? (
            <textarea
              value={formState.bio || ""}
              onChange={e => handleChange("bio", e.target.value)}
              className="ProfileBioInput"
            />
          ) : (
            <div className="BioBox">
              {user.bio}
            </div>
          )}
        </div>

        {/* My Skills Section */}
        <div className="SkillsSection">
          <h3 className="SectionHeader">My Skills</h3>
          <div className="skill-grid">
            {userSkills.length === 0 ? (
              <p>No skills created yet.</p>
            ) : (
              userSkills.map(skill => (
                <div className="skill-item-wrapper" key={skill.skillId || skill.id}>
                  <div 
                    className="SkillCard"
                    onClick={() => {
                      if (!isEditing) {
                        const skillId = skill.skillId || skill.id || skill._id;
                        navigate(`/my-skills/${skillId}`);
                      }
                    }}
                    style={{ cursor: isEditing ? 'default' : 'pointer' }}
                  >
                    {skill.name}
                  </div>
                  {isEditing && (
                    <button
                      className="delete-skill-btn"
                      onClick={(e) => confirmDelete(skill, e)}
                      aria-label="Delete skill"
                    >×</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action buttons including Saved Skills */}
        <div className="ActionButtons">
          <Link to="/saved">
            <button className="SavedSkillsButton">Saved Skills</button>
          </Link>
          <Link to="/upload">
            <button className="EditProfileButton">Create a Skill</button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Delete Skill</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete "{skillToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button className="delete-modal-btn cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="delete-modal-btn confirm" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;



