import React, { useState, useEffect, useContext } from "react";
import "./UploadSkill.css";
import { SkillsContext } from "./SkillsContext";

export default function UploadSkill() {
  const { skills } = useContext(SkillsContext);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  // allow multiple images and multiple videos
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (skills && skills.length > 0) {
      const unique = [
        ...new Set(skills.map((skill) => skill.category).filter(Boolean)),
      ];
      setCategories(unique.sort());
    }
  }, [skills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!category || !skillName || !description) {
      setMessage("Please fill in all fields.");
      return;
    }

    const briefText =
      description.length > 120
        ? description.slice(0, 117) + "..."
        : description;

    try {
      // Use FormData instead of JSON so we can send the video file
      const formData = new FormData();
      formData.append("name", skillName);
      formData.append("category", category);
      formData.append("brief", briefText);
      formData.append("detail", description);
      formData.append("userId", 1);          // temp values
      formData.append("username", "demo");   // temp values
      // Attach images and videos (if any) under `images`/`videos` keys
      if (images && images.length) {
        images.forEach((f) => formData.append('images', f));
      }
      if (videos && videos.length) {
        videos.forEach((f) => formData.append('videos', f));
      }

      // Use relative path to allow CRA dev proxy to route to backend
      // Attach Authorization header with JWT token if present
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `jwt ${token}` } : {};
      const response = await fetch(`/api/skills`, {
        method: "POST",
        headers,
        body: formData, // ❗ no Content-Type header, browser sets it
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload skill");
      }

      const savedSkill = await response.json();
      console.log("Saved skill:", savedSkill);

      setMessage(`"${savedSkill.name}" added under "${savedSkill.category}"!`);
      setCategory("");
      setSkillName("");
      setDescription("");
      setImages([]);
      setVideos([]);
    } catch (err) {
      console.error("Error uploading skill:", err);
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleVideosChange = (e) => {
    setVideos(Array.from(e.target.files || []));
  };

  return (
    <div className="upload-skill-page">
      <header className="upload-skill-header">
        <h1 className="upload-skill-title">Upload</h1>
      </header>

      <div className="upload-skill-body">
        <div className="upload-skill-container">
          <form className="upload-skill-form" onSubmit={handleSubmit}>
            {/* Category dropdown */}
            <label htmlFor="category">Select Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
            >
              <option value="">-- Choose a category --</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Skill name */}
            <label htmlFor="skillName">Skill Name</label>
            <input
              id="skillName"
              type="text"
              className="form-input"
              placeholder="e.g. Graphic Design"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />

            {/* Description */}
            <label htmlFor="description">Description / Expertise</label>
            <textarea
              id="description"
              className="form-input"
              placeholder="Describe your experience, projects, or strengths in this skill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Images input */}
            <label htmlFor="images">Attach Images</label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />

            {images && images.length > 0 && (
              <div className="preview-images">
                {images.map((f, idx) => (
                  <img key={idx} src={URL.createObjectURL(f)} alt={`preview-${idx}`} className="preview-thumb" />
                ))}
              </div>
            )}

            {/* Video input (multiple) */}
            <label htmlFor="videos">Attach Demo Videos</label>
            <input
              id="videos"
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideosChange}
            />

            {videos && videos.length > 0 && (
              <div className="preview-videos">
                {videos.map((f, idx) => (
                  <video key={idx} controls className="preview-video" src={URL.createObjectURL(f)} />
                ))}
              </div>
            )}

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>

          {message && <p className="upload-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
