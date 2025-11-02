import React, { useState } from "react";
import "./UploadSkill.css";

export default function UploadSkill() {
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!skillName || !description) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Mock skill upload logic
    console.log({
      skillName,
      description,
      video,
    });

    setMessage(`${skillName} added to your offered skills!`);
    setSkillName("");
    setDescription("");
    setVideo(null);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  return (
    <div className="upload-skill-page">
      <header className="upload-skill-header">
        <h1 className="upload-skill-title">Upload</h1>
      </header>

      <div className="upload-skill-body">
      <div className="upload-skill-container">
        <h2 className="upload-skill-section-title">Upload New Skill</h2>

      <form className="upload-skill-form" onSubmit={handleSubmit}>
        <label htmlFor="skillName">Skill Name</label>
        <input
          id="skillName"
          type="text"
          placeholder="e.g. Graphic Design"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />

        <label htmlFor="description">Description / Expertise</label>
        <textarea
          id="description"
          placeholder="Describe your experience, projects, or strengths in this skill..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="video">Attach Demo Video</label>
        <input
          id="video"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />

        {video && (
          <video
            controls
            className="preview-video"
            src={URL.createObjectURL(video)}
          />
        )}

        <button type="submit" className="submit-btn">
          Submit Skill
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}
      </div>
      </div>
    </div>
  );
}
