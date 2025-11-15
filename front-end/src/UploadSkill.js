import React, { useState, useEffect, useContext } from "react";
import "./UploadSkill.css";
import { SkillsContext } from "./SkillsContext";

export default function UploadSkill() {
  const { skills } = useContext(SkillsContext);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
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
      const response = await fetch("http://localhost:4000/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // matching Mockaroo schema
          name: skillName,
          brief: briefText,
          detail: description,
          category,
          image: "",        
          userId: 1,        // temp values
          username: "demo", // temp
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload skill");
      }

      const savedSkill = await response.json();
      console.log("Saved skill:", savedSkill);

      setMessage(
        `"${savedSkill.name}" added under "${savedSkill.category}"!`
      );
      setCategory("");
      setSkillName("");
      setDescription("");
      setVideo(null);
    } catch (err) {
      console.error("Error uploading skill:", err);
      setMessage(`Error: ${err.message}`);
    }
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

            {/* Video input */}
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
              Submit
            </button>
          </form>

          {message && <p className="upload-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
