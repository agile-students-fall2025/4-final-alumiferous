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

  // Load logged‑in user's profile
  useEffect(() => {
    const storedUserId =
      localStorage.getItem('userId') || localStorage.getItem('currentUserId');

    if (!storedUserId) {
      navigate('/login');
      return;
    }

    fetch(`/api/profile/${storedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setFormState({ ...data });
        setPhotoFile(null);
      })
      .catch((err) => {
        console.error('Error loading profile:', err);
      });
  }, [navigate]);

  // Restore edit mode after reload
  useEffect(() => {
    const editMode = sessionStorage.getItem('profileEditMode');
    if (editMode === 'true') {
      setIsEditing(true);
      sessionStorage.removeItem('profileEditMode');
    }
  }, []);

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleChange = (field, value) =>
    setFormState((s) => ({ ...s, [field]: value }));

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
    formData.append(
      'skillsOffered',
      JSON.stringify(formState.skillsOffered || [])
    );
    formData.append(
      'skillsWanted',
      JSON.stringify(formState.skillsWanted || [])
    );
    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    }

    const res = await fetch(`/api/profile/${user._id}`, {
      method: 'PUT',
      body: formData,
    });

    if (res.ok) {
      const updated = await fetch(`/api/profile/${user._id}`).then((r) =>
        r.json()
      );
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
      // delete on server
      const res = await fetch(`/api/skills/${skillId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Server failed to delete skill');
      }

      // update localStorage caches
      const userSkillsCache = JSON.parse(
        localStorage.getItem('userSkills') || '[]'
      );
      const updatedUserSkills = userSkillsCache.filter((s) => {
        const sId = s._id || s.skillId || s.id;
        return String(sId) !== String(skillId);
      });
      localStorage.setItem('userSkills', JSON.stringify(updatedUserSkills));

      const cachedSkills = JSON.parse(
        localStorage.getItem('skills') || '[]'
      );
      const updatedSkills = cachedSkills.filter((s) => {
        const sId = s._id || s.skillId || s.id;
        return String(sId) !== String(skillId);
      });
      localStorage.setItem('skills', JSON.stringify(updatedSkills));

      // keep edit mode and refresh UI
      sessionStorage.setItem('profileEditMode', 'true');
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
      const id = skillToDelete._id || skillToDelete.skillId || skillToDelete.id;
      handleDeleteSkill(id);
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
  const userCreatedSkills = JSON.parse(
    localStorage.getItem('userSkills') || '[]'
  );

  // Also filter from context if needed
  const contextUserSkills = skills.filter(
    (skill) => String(skill.userId) === String(user._id)
  );

  // Merge and remove duplicates
  const mergedSkills = [...userCreatedSkills];
  contextUserSkills.forEach((skill) => {
    if (
      !mergedSkills.find(
        (s) =>
          s._id === skill._id ||
          s.skillId === skill.skillId ||
          s.id === skill.id
      )
    ) {
      mergedSkills.push(skill);
    }
  });

  // Ensure every skill has a consistent _id for routing
  const userSkills = mergedSkills.map((s) => {
    const id = s._id || s.skillId || s.id;
    return { ...s, _id: id };
  });

  return (
    <main>
      <div className="ProfileContent">
        <div className="ProfileHeader">
          <h1
            className="ProfileTitle"
            onClick={() => navigate('/Profile')}
          >
            Profile
          </h1>
          <button
            className="EditButton"
            onClick={isEditing ? handleSave : handleEditToggle}
            title={isEditing ? 'Save Profile' : 'Edit Profile'}
          >
            {isEditing ? 'Save' : (
              <PencilSquareIcon style={{ width: 22, height: 22 }} />
            )}
          </button>
        </div>

        <img
          className="Avatar"
          src={
            isEditing && photoFile
              ? URL.createObjectURL(photoFile)
              : user.avatarURL || '/images/avatar-default.png'
          }
          alt="Avatar"
        />

        {isEditing && (
          <>
            <input
              type="file"
              accept="image/*"
              id="profile-photo-upload"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <label
              htmlFor="profile-photo-upload"
              className="UploadButton"
              tabIndex={0}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: 10,
              }}
            >
              Upload/Change Photo
            </label>
          </>
        )}

        <div className="UserInfo">
          {isEditing ? (
            <>
              <input
                className="ProfileUsernameInput form-input"
                value={formState.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="First Name"
              />
              <input
                className="ProfileUsernameInput form-input"
                value={formState.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Last Name"
                style={{ marginTop: 8 }}
              />
              <input
                className="ProfileUsernameInput form-input"
                value={formState.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Username"
                style={{ marginTop: 8 }}
              />
            </>
          ) : (
            <>
              <h2 className="ProfileFullName">
                {user.firstName} {user.lastName}
              </h2>
              <div className="ProfileUsername">@{user.username}</div>
            </>
          )}
        </div>

        <div className="AboutSection">
          <div className="AboutLabel">About</div>
          {isEditing ? (
            <textarea
              value={formState.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="ProfileBioInput form-input"
            />
          ) : (
            <div className="BioBox">{user.bio}</div>
          )}
        </div>

        {/* My Skills Section */}
        <div className="SkillsSection">
          <h3 className="SectionHeader">My Skills</h3>
          <div className="skill-grid">
            {userSkills.length === 0 ? (
              <p>No skills created yet.</p>
            ) : (
              userSkills.map((skill) => (
                <div
                  className="skill-item-wrapper"
                  key={skill._id}
                >
                  <div
                    className="SkillCard"
                    onClick={() => {
                      if (!isEditing && skill._id) {
                        navigate(`/my-skills/${skill._id}`);
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
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action buttons */}
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
        <div
          className="delete-modal-overlay"
          onClick={handleDeleteCancel}
        >
          <div
            className="delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="delete-modal-title">Delete Skill</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete "{skillToDelete?.name}"? This
              action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button
                className="delete-modal-btn cancel"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="delete-modal-btn confirm"
                onClick={handleDeleteConfirm}
              >
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




