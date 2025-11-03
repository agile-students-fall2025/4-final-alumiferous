import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UploadSkill.css";

export default function UploadSkill() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = `${process.env.REACT_APP_SKILLS_URL}?count=${process.env.REACT_APP_MOCKAROO_COUNT}&key=${process.env.REACT_APP_MOCKAROO_KEY}`;
        const res = await axios.get(url);
        console.log("Mockaroo skills sample:", res.data[0]);

        const uniqueCategories = [
          ...new Set(res.data.map((skill) => skill.category)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category || !skillName || !description) {
      setMessage("Please fill in all fields.");
      return;
    }

    console.log({
      category,
      skillName,
      description,
      video,
    });

    setMessage(`${skillName} added under ${category} category!`);
    setCategory("");
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
      <form className="upload-skill-form" onSubmit={handleSubmit}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input"
        >
          <option value="">-- Choose a category --</option>
          {categories.length > 0 ? (
            categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))
          ) : (
            <option disabled>Loading categories...</option>
          )}
        </select>

        <label htmlFor="skillName">Skill Name</label>
        <input
          id="skillName"
          type="text"
          className="form-input"
          placeholder="e.g. Graphic Design"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />

        <label htmlFor="description">Description / Expertise</label>
        <textarea
          id="description"
          className="form-input"
          placeholder="Describe your experience, projects, or strengths in this skill..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />        <label htmlFor="video">Attach Demo Video</label>
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
          Submit
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}
      </div>
      </div>
    </div>
  );
}
