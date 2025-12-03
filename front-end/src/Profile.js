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

useEffect(() => {
  const storedUserId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
  if (!storedUserId) {
    // optionally redirect to login if no user
    navigate('/login');
    return;
  }

  fetch(`/api/profile/${storedUserId}`)
    .then(res => res.json())
    .then(data => {
      setUser(data);
      setFormState({ ...data });
      setPhotoFile(null);
    })
    .catch(err => {
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
      <div className="flex flex-col items-center justify-center min-h-screen w-screen max-w-[600px] bg-white dark:bg-[#121212] overflow-hidden p-0 pt-[65px] mt-2.5 mb-4 mx-auto md:pt-[calc(65px+62px)] md:pb-[120px] md:scroll-smooth">
        <div className="fixed top-[65px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen shrink-0 md:px-3 md:py-3">
          <h1 className="text-2xl md:text-xl font-semibold text-[#333] dark:text-[#f1f1f1] m-0 flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis" onClick={() => navigate("/Profile")}>Profile</h1>
          <button
            className="bg-transparent border-none text-xl text-[#333] dark:text-white rounded-full p-1.5 mr-1.5 shadow-none outline-none transition-colors duration-200 flex items-center justify-center"
            onClick={isEditing ? handleSave : handleEditToggle}
            title={isEditing ? "Save Profile" : "Edit Profile"}
          >
            {isEditing ? "Save" : <PencilSquareIcon className="w-[22px] h-[22px]" />}
          </button>
        </div>
          <img
            className="w-[104px] h-[104px] md:w-[72px] md:h-[72px] rounded-full object-cover shadow-[0_2px_12px_rgba(33,89,135,0.11)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border-4 border-[#e6f0ff] dark:border-[#2b2b2b] mt-2 mb-1 block mx-auto"
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
                className="cursor-pointer inline-block mt-2.5 bg-primary text-white border-none rounded-app py-3 px-6 font-semibold hover:bg-primary-hover transition-colors"
                tabIndex={0}
              >
                Upload/Change Photo
              </label>
            </>
          )}
        <div className="text-center mb-4 flex flex-col items-center">
          {isEditing ? (
            <>
            <input
              className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center block bg-white dark:bg-[#2b2b2b] mx-auto mb-2 dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
              value={formState.firstName || ""}
              onChange={e => handleChange("firstName", e.target.value)}
              placeholder="First Name"
            />
            <input
              className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center block bg-white dark:bg-[#2b2b2b] mx-auto mb-2 dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7] mt-2"
              value={formState.lastName || ""}
              onChange={e => handleChange("lastName", e.target.value)}
              placeholder="Last Name"
            />
            <input
              className="w-full max-w-[520px] text-xl font-normal py-2.5 px-4 rounded-[13px] border-2 border-[#cbcbcb] dark:border-[#444] text-center block bg-white dark:bg-[#2b2b2b] mx-auto mb-2 dark:text-[#f1f1f1] focus:outline-none focus:border-primary dark:focus:border-[#4dabf7] mt-2"
              value={formState.username || ""}
              onChange={e => handleChange("username", e.target.value)}
              placeholder="Username"
            />
            </>
          ) : (
            <>
              <h2 className="m-0 mb-0.5 text-[22px] font-normal text-[#191c1f] dark:text-[#f1f1f1] text-center tracking-[-0.01em]">
                {user.firstName} {user.lastName}
              </h2>
              <div className="text-[#6a7791] dark:text-[#a0a0a0] text-[15px] text-center font-medium mb-1 tracking-[0.01em]">
                @{user.username}
              </div>
            </>
          )}
        </div>

        <div className="w-1/2 md:w-[92vw] max-w-[540px] my-2 mx-auto flex flex-col items-center md:px-3">
          <div className="text-[1.16rem] font-bold text-black dark:text-[#f1f1f1] mb-0.5 text-center">About</div>
          {isEditing ? (
            <textarea
              value={formState.bio || ""}
              onChange={e => handleChange("bio", e.target.value)}
              className="w-[96%] max-w-[520px] min-h-[80px] py-4 px-4 rounded-[13px] bg-white dark:bg-[#2b2b2b] border-[1.5px] border-black dark:border-[#444] text-[#313741] dark:text-[#f1f1f1] text-[1.13rem] shadow-[0_1px_5px_rgba(255,255,255,0.06)] dark:shadow-[0_1px_5px_rgba(0,0,0,0.3)] mx-auto resize-y focus:outline-none focus:border-primary dark:focus:border-[#4dabf7]"
            />
          ) : (
            <div className="w-[90%] min-h-[50px] py-4 px-4 rounded-[13px] bg-white dark:bg-[#1e1e1e] border-[1.5px] border-[#e0e0e0] dark:border-[#444] text-[#313741] dark:text-[#f1f1f1] text-[1.13rem] shadow-[0_1px_5px_rgba(37,100,230,0.06)] dark:shadow-[0_1px_5px_rgba(0,0,0,0.3)] mx-auto text-left break-words">
              {user.bio}
            </div>
          )}
        </div>

        {/* My Skills Section */}
        <div className="w-full max-w-[540px] mt-[18px] mx-auto mb-0 flex flex-col items-center">
          <h3 className="text-lg font-bold text-black dark:text-[#f1f1f1] mb-2 text-center">My Skills</h3>
          <div className="w-full flex flex-col items-center gap-3.5 mb-[18px]">
            {userSkills.length === 0 ? (
              <p className="text-center text-[#666] dark:text-[#a0a0a0] text-[15px]">No skills created yet.</p>
            ) : (
              userSkills.map(skill => (
                <div className="flex flex-row items-center gap-2 flex-nowrap w-auto" key={skill.skillId || skill.id}>
                  <div 
                    className="py-3 px-[17px] rounded-[18px] bg-primary dark:bg-primary text-white font-semibold shadow-[0_2.5px_13px_rgba(40,120,220,0.10)] dark:shadow-[0_2.5px_13px_rgba(77,171,247,0.2)] cursor-pointer text-[15px] tracking-[0.01em] inline-block whitespace-nowrap min-w-[90px] hover:bg-primary-hover"
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
                      className="w-5 h-5 min-w-[20px] min-h-[20px] rounded-full bg-[#dc3545] text-white border-none text-sm font-bold cursor-pointer inline-flex items-center justify-center leading-none p-0 transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.15)] shrink-0 align-middle hover:bg-[#c82333] hover:scale-110 active:scale-95"
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
        <div className="flex flex-row justify-center items-center gap-2.5 mt-2">
          <Link to="/saved">
            <button className="btn btn-primary">Saved Skills</button>
          </Link>
          <Link to="/upload">
            <button className="btn btn-primary">Create a Skill</button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={handleDeleteCancel}>
          <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl max-w-[400px] w-[90%] shadow-[0_4px_20px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-3 ml-0 mr-0 text-xl font-semibold text-[#333] dark:text-[#f1f1f1]">Delete Skill</h3>
            <p className="m-0 mb-6 text-[15px] text-[#666] dark:text-[#a0a0a0] leading-[1.5]">
              Are you sure you want to delete "{skillToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn bg-danger hover:bg-red-700 text-white" onClick={handleDeleteConfirm}>
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



