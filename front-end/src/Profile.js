import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check for locally edited profile first
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      setUser(JSON.parse(storedProfile));
      setLoading(false);
      return;
    }
    // Otherwise, fetch from Mockaroo
    const apiKey = process.env.REACT_APP_MOCKAROO_KEY;
    fetch(`https://my.api.mockaroo.com/users.json?key=${apiKey}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        setUser(data[0]);
        setLoading(false);
      })
      .catch(err => {
        setFeedback('Error: ' + err.message);
        const mockUser = {
        username: 'demo_user',
        profilePhoto: '/images/avatar-default.png',
        about: 'Welcome to your profile! Edit your profile to add your bio and skills.',
        skillsAcquired: ['JavaScript', 'React', 'CSS'],
        skillsWanted: ['Node.js', 'Python', 'Design']
      };
      setUser(mockUser);
      setLoading(false);

        setLoading(false);
      });
  }, []);

  // Menu and localStorage save omitted for brevity

  if (loading) return <main>Loading profile...</main>;
  if (feedback && !user) return <main>{feedback}</main>;
  if (!user) return <main>No user found.</main>;

  return (
    <main className="Profile">
      <header className="ProfileHeader">
        <h1 className="ProfileTitle">{user.username}</h1>
        {/* Menu omitted for brevity */}
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


