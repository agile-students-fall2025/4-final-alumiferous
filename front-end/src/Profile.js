import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SkillsContext } from './SkillsContext';
import './Profile.css';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
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

  if (!user) return <main>Loading...</main>;

  const userSkills = skills.filter(skill => String(skill.userId) === String(user._id));

  return (
    <main>
      <div className="ProfileContent">
        <div className="ProfileHeader">
          <h1 className="ProfileTitle">My Profile</h1>
          <button
            className="EditButton"
            onClick={isEditing ? handleSave : handleEditToggle}
            title={isEditing ? "Save Profile" : "Edit Profile"}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {isEditing ? "Save" : <PencilSquareIcon style={{ width: 22, height: 22 }} />}
          </button>
        </div>
        <div className="ProfilePhotoSection">
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
        </div>
        <div className="UserInfo">
          {isEditing ? (
            <>
              <input
                type="text"
                className="ProfileUsernameInput"
                value={formState.firstName || ""}
                onChange={e => handleChange("firstName", e.target.value)}
                placeholder="First Name"
              />
              <input
                type="text"
                className="ProfileUsernameInput"
                value={formState.lastName || ""}
                onChange={e => handleChange("lastName", e.target.value)}
                placeholder="Last Name"
                style={{ marginTop: 8 }}
              />
              <input
                type="text"
                className="ProfileUsernameInput"
                value={formState.username || ""}
                onChange={e => handleChange("username", e.target.value)}
                placeholder="Username"
                style={{ fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center', marginTop: 8 }}
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
          <h3>About</h3>
          {isEditing ? (
            <textarea
              value={formState.bio || ""}
              onChange={e => handleChange("bio", e.target.value)}
              className="ProfileBioInput"
            />
          ) : (
            <p>{user.bio}</p>
          )}
        </div>
        <div className="skill-grid">
          {userSkills.length === 0 ? (
            <p>No skills created yet.</p>
          ) : (
            userSkills.map(skill =>
              <div className="SkillCard" key={skill.skillId}>
                {skill.name}
              </div>
            )
          )}
        </div>
        {/* Action buttons including Saved Skills */}
        <div className="ActionButtons">
          <Link to="/saved">
            <button className="SavedSkillsButton">Saved Skills</button>
          </Link>
          <Link to="/edit-profile">
            <button className="EditProfileButton">Create a Skill</button>
          </Link>
          <Link to="/settings">
            <button className="AccountSettingsButton">Account Settings</button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Profile;



