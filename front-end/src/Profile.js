import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  useEffect(() => {
    //alert('Welcome to your Profile Page!')
    console.log('Profile Page loaded.')
  }, [])

  const handleEditClick = () => {
    setFeedback('Edit Profile Clicked!')
    console.log('Edit Profile clicked')
  }

  return (
    <main className="Profile">
      <header className="ProfileHeader">
        <button className="BackButton" onClick={() => window.history.back()}>
          ← Back
        </button>
        <input className="SearchBar" placeholder="Search..." />
        <button className="MenuButton">☰ Menu</button>
      </header>
      <section className="ProfileCard">
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
      </section>
      {feedback && <div className="Profile-feedback">{feedback}</div>}
    </main>
  )
}

export default Profile

