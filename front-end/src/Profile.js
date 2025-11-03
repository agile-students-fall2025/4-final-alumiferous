import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline'
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_MOCKAROO_KEY;
    fetch(`https://my.api.mockaroo.com/users.json?key=${apiKey}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        setUser(data[0]); // Use the first user as a demo
        setLoading(false);
      })
      .catch(err => {
        setFeedback('Error: ' + err.message);
        setLoading(false);
        console.error('API Error', err);
      });
  }, []);

  // Menu close listeners
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleEditClick = () => {
    setFeedback('Edit Profile Clicked!');
    console.log('Edit Profile clicked');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('profile', JSON.stringify(user));
      setFeedback('Profile saved');
    } catch (e) {
      console.error('Failed to save profile', e);
      setFeedback('Failed to save');
    } finally {
      setMenuOpen(false);
    }
  };

  // Handle loading, fetch, missing user
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
            <Bars3Icon />
          </button>
          {menuOpen && (
            <div className="MenuDropdown" role="menu">
              <button className="MenuItem" role="menuitem" onClick={handleSave}>
                <Link to="/saved" className="MenuItemLink">Save</Link>
              </button>
              <button className="MenuItem" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Link to="/settings" className="MenuItemLink">Settings</Link>
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="ProfileBody">
        <img className="Avatar" src={user.profilePhoto} alt="User Avatar" />
        <div className="UserInfo">
          <h2>{user.username}</h2>
          {/* Add pronouns here if available */}
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
            <button className="EditProfileButton" onClick={handleEditClick}>
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

