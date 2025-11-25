import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import { SkillsContext } from './SkillsContext';
import Skill from './Skill';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Get all skills from context
  const { skills } = useContext(SkillsContext);

  useEffect(() => {
    // Fetch the profile from backend only
    fetch('http://localhost:4000/api/profile/691d0ed8081ddc1c4a66116d')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setFeedback('Error: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Filter user's offered and wanted skills from context, matching their userId
const userSkills = skills.filter(
  skill => String(skill.userId) === String(user?._id)
);


  // save logic
  const handleSave = () => {
    setTimeout(() => setFeedback(''), 3000);
    setMenuOpen(false);
  };

  if (loading) return <main>Loading profile...</main>;
  if (feedback && !user) return <main>{feedback}</main>;
  if (!user) return <main>No user found.</main>;

  return (
    <main className="Profile">
      <header className="ProfileHeader">
        <h1 className="ProfileTitle">My Skills</h1>
        <div className="ProfileMenu" ref={menuRef}>
          <button
            className="MenuButton"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          {menuOpen && (
            <div className="MenuDropdown" role="menu">
              <button className="MenuItem" role="menuitem" onClick={handleSave}>
                <Link to="/saved" className="MenuItemLink">Save</Link>
              </button>
              <button className="MenuItem" role="menuitem" onClick={() => { setMenuOpen(false) }}>
                <Link to="/settings" className="MenuItemLink">Settings</Link>
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="ProfileBody">
        <img className="Avatar" src={user.avatarUrl || "/images/avatar-default.png"} alt="User Avatar" />
        <div className="UserInfo">
          <h2>{user.username}</h2>
        </div>
        <div className="AboutSection">
          <h3>About</h3>
          <p>{user.bio}</p>
        </div>

        <div className="SkillsSection">
          <h4>My Skills</h4>
          <div className="skill-grid">
            {userSkills.length === 0 ? (
              <p>No skills added yet.</p>
            ) : (
              userSkills.map(skill => (
                <Skill
                  key={skill.skillId}
                  {...skill}
                  skillImg={`//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`}
                  ImgHeight={skill.height}
                />
              ))
            )}
          </div>
        </div>


        <div className="ActionButtons">
          <Link to="/edit-profile">
            <button className="EditProfileButton">
              Create a Skill 
            </button>
          </Link>
          <Link to="/settings">
            <button className="AccountSettingsButton">Account Settings</button>
          </Link>
        </div>
        {feedback && <div className="Profile-feedback">{feedback}</div>}
      </div>
    </main>
  );
};

export default Profile;

