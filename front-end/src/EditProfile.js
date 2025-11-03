import React from 'react';
import './Profile.css'; // reuse page + body styles
import './EditProfile.css';
import './Messages.css'; // reuse messages-style header

const EditProfile = () => (
  <main className="Profile">
    <header className="messages-header edit-profile-header">
      <button className="back-btn" onClick={() => window.history.back()} aria-label="Back">←</button>
    </header>
    <div className="ProfileBody edit-profile-body">
      <div className="ProfilePhotoSection">
        <img className="Avatar" src="/images/avatar-default.png" alt="Profile" />
        <button className="UploadButton">Upload/Change Photo</button>
      </div>
      <div className="AboutSection">
        <label htmlFor="about">About Me:</label>
        <textarea id="about" maxLength={500} />
      </div>
      <div className="SkillsSection">
        <div>
          <h4>Skills Offered:</h4>
          <button>Add Skills +</button>
          <button>Remove Skills -</button>
        </div>
        <div>
          <h4>Skills Wanted:</h4>
          <button>Add Skills +</button>
          <button>Remove Skills -</button>
        </div>
      </div>
      <button className="SaveButton">Save Changes</button>
    </div>
  </main>
);

export default EditProfile;