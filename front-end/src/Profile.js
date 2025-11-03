import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState({
    name: 'Jane Owen',
    pronouns: 'she/her',
    bio: 'Passionate about languages and discovering new cultures through travel.',
    avatar: process.env.PUBLIC_URL + '/images/avatar-default.png',
    skillsOffered: ['Arabic', 'English', 'Sketching'],
    skillsWanted: ['Knitting', 'Javascript'],
  })
  const [feedback, setFeedback] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    //alert('Welcome to your Profile Page!')
    console.log('Profile Page loaded.')
  }, [])

  const handleEditClick = () => {
    setFeedback('Edit Profile Clicked!')
    console.log('Edit Profile clicked')
  }

  const handleSave = () => {
    try {
      // Persist the full profile only
      localStorage.setItem('profile', JSON.stringify(user))
      setFeedback('Profile saved')
    } catch (e) {
      console.error('Failed to save profile', e)
      setFeedback('Failed to save')
    } finally {
      setMenuOpen(false)
    }
  }

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <main className="Profile">
      <header className="ProfileHeader">
        <h1 className="ProfileTitle">Profile</h1>
        {/* Search removed per request */}
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
              <button className="MenuItem" role="menuitem" onClick={() => { setMenuOpen(false) }}>
                <Link to="/settings" className="MenuItemLink">Settings</Link>
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="ProfileBody">
        <img className="Avatar" src={user.avatar} alt="User Avatar" />
        <div className="UserInfo">
          <h2>{user.name}</h2>
          <p>{user.pronouns}</p>
        </div>
        <div className="AboutSection">
          <h3>About</h3>
          <p>{user.bio}</p>
        </div>
        <div className="SkillsSection">
          <div className="SkillsOffered">
            <h4>Skills Offered</h4>
            {user.skillsOffered.map((skill, i) => (
              <span key={i} className="SkillTag">{skill}</span>
            ))}
          </div>
          <div className="SkillsWanted">
            <h4>Skills Wanted</h4>
            {user.skillsWanted.map((skill, i) => (
              <span key={i} className="SkillTag wanted">{skill}</span>
            ))}
          </div>
        </div>
        <div className="ActionButtons">
          <Link to="/edit-profile">
            <button className="EditProfileButton" >
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
  )
}

export default Profile

