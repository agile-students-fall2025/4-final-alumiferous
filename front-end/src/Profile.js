import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillsContext } from './SkillsContext';
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
    <main className="min-h-screen bg-white dark:bg-[#121212] pt-20 pb-24">
      {/* Header */}
      <div className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <h1 
          className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate("/Profile")}
        >
          Profile
        </h1>
        <button
          className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-gray-100 dark:hover:bg-[#2b2b2b] text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={isEditing ? handleSave : handleEditToggle}
          title={isEditing ? "Save Profile" : "Edit Profile"}
        >
          {isEditing ? "Save" : <PencilSquareIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 mt-[72px]">
        {/* Header with Profile Title and Edit/Save Button */}
        <div className="flex justify-between items-center mb-6">
        </div>

        {/* Profile Photo */}
        <div className="text-center mb-6">
          <img
            className="w-[104px] h-[104px] rounded-full object-cover shadow-lg border-4 border-[#e6f0ff] dark:border-[#2b2b2b] mx-auto"
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
                className="hidden"
                onChange={handlePhotoChange}
              />
              <label
                htmlFor="profile-photo-upload"
                className="cursor-pointer inline-block mt-3 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
                tabIndex={0}
              >
                Upload/Change Photo
              </label>
            </>
          )}
        </div>

        {/* User Info (Name and Username) */}
        <div className="text-center mb-6">
          {isEditing ? (
            <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
              <input
                className="w-full text-base py-2 px-3 rounded-lg border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] text-[#191c1f] dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
                value={formState.firstName || ""}
                onChange={e => handleChange("firstName", e.target.value)}
                placeholder="First Name"
              />
              <input
                className="w-full text-base py-2 px-3 rounded-lg border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] text-[#191c1f] dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
                value={formState.lastName || ""}
                onChange={e => handleChange("lastName", e.target.value)}
                placeholder="Last Name"
              />
              <input
                className="w-full text-base py-2 px-3 rounded-lg border-2 border-[#cbcbcb] dark:border-[#444] text-center bg-white dark:bg-[#2b2b2b] text-[#191c1f] dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
                value={formState.username || ""}
                onChange={e => handleChange("username", e.target.value)}
                placeholder="Username"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-[#191c1f] dark:text-[#f1f1f1] mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <div className="text-[#6a7791] dark:text-[#a0a0a0] text-base font-medium">
                @{user.username}
              </div>
            </>
          )}
        </div>

        {/* About Section */}
        <div className="mb-6">
          <div className="text-lg font-bold text-[#191c1f] dark:text-[#f1f1f1] mb-3 text-center">About</div>
          {isEditing ? (
            <textarea
              value={formState.bio || ""}
              onChange={e => handleChange("bio", e.target.value)}
              className="w-full min-h-[100px] py-3 px-4 rounded-lg bg-white dark:bg-[#2b2b2b] border-2 border-[#cbcbcb] dark:border-[#444] text-[#313741] dark:text-[#f1f1f1] text-base text-center resize-y focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="w-full min-h-[80px] py-4 px-4 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#444] text-[#313741] dark:text-[#f1f1f1] text-base text-center shadow-sm">
              {user.bio || "No bio added yet"}
            </div>
          )}
        </div>

        {/* My Skills Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#191c1f] dark:text-[#f1f1f1] mb-3 text-center">My Skills</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {userSkills.length === 0 ? (
              <p className="text-[#6a7791] dark:text-[#a0a0a0]">No skills created yet.</p>
            ) : (
              userSkills.map(skill => (
                <div className="relative" key={skill.skillId || skill.id}>
                  <div 
                    className={`inline-flex items-center bg-primary text-white font-medium py-2 px-4 rounded-full ${!isEditing ? 'cursor-pointer hover:bg-primary-hover' : 'cursor-default'} transition-colors`}
                    onClick={() => {
                      if (!isEditing && skill._id) {
                        navigate(`/my-skills/${skill._id}`);
                      }
                    }}
                  >
                    {skill.name}
                  </div>
                  {isEditing && (
                    <button
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
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

        {/* Action Buttons */}
        <div className="flex gap-3 mt-12">
          <Link to="/saved" className="flex-1">
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Saved Skills
            </button>
          </Link>
          <Link to="/upload" className="flex-1">
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Offer a Skill
            </button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleDeleteCancel}>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#191c1f] dark:text-[#f1f1f1] mb-3">Delete Skill</h3>
            <p className="text-[#313741] dark:text-[#c0c0c0] mb-6">
              Are you sure you want to delete "{skillToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                className="bg-[#f5f5f5] dark:bg-[#2b2b2b] hover:bg-[#e8e8e8] dark:hover:bg-[#3a3a3a] text-[#191c1f] dark:text-[#f1f1f1] font-semibold py-2 px-6 rounded-lg transition-colors"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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




