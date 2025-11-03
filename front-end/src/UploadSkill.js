import React, { useState, useEffect } from "react";
import "./UploadSkill.css";

export default function UploadSkill() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = process.env.REACT_APP_MOCKAROO_KEY;
        if (!apiKey) throw new Error("Missing REACT_APP_MOCKAROO_KEY env var");

        const res = await fetch(
          "https://api.mockaroo.com/api/b9916500?count=1000",
          {
            headers: { "X-API-Key": apiKey },
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        const unique = [
          ...new Set(data.map((skill) => skill.category).filter(Boolean)),
        ];
        if (isMounted) setCategories(unique);
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (isMounted) setError("Failed to load categories.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => (isMounted = false);
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

  if (loading) return <p className="upload-message">Loading categories…</p>;
  if (error) return <p className="upload-message error">{error}</p>;

  return (
    <div className="upload-skill-container">
      <h2 className="upload-skill-title">Upload New Skill</h2>

      <form className="upload-skill-form" onSubmit={handleSubmit}>
        {/* Category dropdown */}
        <label htmlFor="category">Select Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
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
          placeholder="e.g. Graphic Design"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />

        {/* Description */}
        <label htmlFor="description">Description / Expertise</label>
        <textarea
          id="description"
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
          Submit Skill
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}
