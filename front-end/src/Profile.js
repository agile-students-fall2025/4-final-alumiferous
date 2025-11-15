import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Fetch the profile from backend only
    fetch('/api/profile/1')
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
        <h1 className="ProfileTitle">Profile</h1>
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
        <img className="Avatar" src={user.profilePhoto || "/images/avatar-default.png"} alt="User Avatar" />
        <div className="UserInfo">
          <h2>{user.username}</h2>
        </div>
        <div className="AboutSection">
          <h3>About</h3>
          <p>{user.about}</p>
        </div>
        <div className="SkillsSection">
          <div className="SkillsOffered">
            <h4>Skills Offered</h4>
            {user.skillsAcquired && user.skillsAcquired.map((skill, i) => (
              <span key={i} className="SkillTag">{skill}</span>
            ))}
          </div>
          <div className="SkillsWanted">
            <h4>Skills Wanted</h4>
            {user.skillsWanted && user.skillsWanted.map((skill, i) => (
              <span key={i} className="SkillTag wanted">{skill}</span>
            ))}
          </div>
        </div>
        <div className="ActionButtons">
          <Link to="/edit-profile">
            <button className="EditProfileButton">
              Edit Profile
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
