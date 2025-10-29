import React from 'react';
import './Profile.css'; // reuse styles
import './EditProfile.css'; 

const EditProfile = () => (
  <main className="Profile EditProfileContainer">
    <header className="ProfileHeader">
      <button className="BackButton" onClick={() => window.history.back()}>
        ←
      </button>
      <h2>Back</h2>
    </header>
    <section className="ProfileCard">
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
    </section>
  </main>
);

export default EditProfile;