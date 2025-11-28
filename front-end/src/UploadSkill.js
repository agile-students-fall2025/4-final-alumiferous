import React, { useState, useEffect, useContext } from "react";
import "./UploadSkill.css";
import { SkillsContext } from "./SkillsContext";

export default function UploadSkill() {
  const { skills } = useContext(SkillsContext);
  const [categories, setCategories] = useState([]);
  const [generalOptions, setGeneralOptions] = useState([]);
  // `category` kept for legacy single-category field; `selectedCategories` is the new multi-select
  const [category, setCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [generalSkill, setGeneralSkill] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = React.useRef(null);
  const [description, setDescription] = useState("");
  // allow multiple images and multiple videos
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    // Fetch fixed data (canonical generalNames and categories) from the backend
    (async function fetchFixed(){
      try {
        const res = await fetch('/api/fixeddata');
        if (!mounted) return;
        if (res.ok) {
          const body = await res.json();
          const g = Array.isArray(body.generalNames) ? body.generalNames : [];
          const c = Array.isArray(body.categories) ? body.categories : [];
          if (g.length) {
            setGeneralOptions(g);
            if (!generalSkill) setGeneralSkill(g[0]);
          }
          if (c.length) setCategories(c.sort());
          return;
        }
      } catch (e) {
        // swallow and fall back to deriving from existing skills
      }

      // Fallback: derive lists from existing skills context
      if (skills && skills.length > 0) {
        const unique = [...new Set(skills.map((skill) => skill.category).filter(Boolean))];
        setCategories(unique.sort());
        const possibleGeneral = [...new Set(skills.map(s => s.generalSkill || s.category || s.name).filter(Boolean))];
        if (possibleGeneral.length && !generalSkill) setGeneralSkill(possibleGeneral[0]);
        if (possibleGeneral.length) setGeneralOptions(possibleGeneral);
      }
    })();
    // click-away: close categories dropdown when clicking outside
    function onDocClick(e){
      if (catsRef.current && !catsRef.current.contains(e.target)) {
        setCatsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => { mounted = false; document.removeEventListener('click', onDocClick); };
  }, [skills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!generalSkill || !skillName || !description) {
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
      // Send both new fields and legacy ones for compatibility
      formData.append("skillName", skillName);
      formData.append("name", skillName);
      formData.append("generalSkill", generalSkill);
      formData.append("category", category);
      // append categories as comma-separated string (backend will accept array or CSV)
      if (selectedCategories && selectedCategories.length) {
        formData.append('categories', selectedCategories.join(','));
      }
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

      // Save to localStorage
      const existingSkills = JSON.parse(localStorage.getItem('userSkills') || '[]');
      existingSkills.push(savedSkill);
      localStorage.setItem('userSkills', JSON.stringify(existingSkills));
      console.log('Saved to localStorage:', existingSkills);

      setMessage(`"${savedSkill.name}" added under "${savedSkill.category}"!`);
      
      // Redirect to profile after 1 second
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1000);
      
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
            {/* General skill selection (canonical grouping) */}
            <label htmlFor="generalSkill">Select Skill (general)</label>
            <select
              id="generalSkill"
              value={generalSkill}
              onChange={(e) => setGeneralSkill(e.target.value)}
              className="form-input"
            >
              <option value="">-- Choose a skill --</option>
              {(generalOptions.length ? generalOptions : (skills && skills.length ? [...new Set(skills.map(s => s.generalSkill || s.category || s.name).filter(Boolean))] : [])).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>

            {/* Categories multi-select dropdown (checkboxes) */}
            <label htmlFor="categories">Categories (select one or more)</label>
            <div className="multi-select" ref={catsRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="form-input"
                onClick={() => setCatsOpen((s) => !s)}
                aria-haspopup="listbox"
                aria-expanded={catsOpen}
              >
                {selectedCategories.length === 0 ? 'Select categories...' : selectedCategories.join(', ')}
              </button>

              {catsOpen && (
                <div className="multi-select-list" style={{ position: 'absolute', zIndex: 40, background: 'white', border: '1px solid #ddd', maxHeight: 220, overflowY: 'auto', width: '100%', marginTop: 6, padding: 8 }}>
                  {categories && categories.length ? categories.map((cat, index) => (
                    <label key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => {
                          setSelectedCategories(prev => {
                            if (prev.includes(cat)) return prev.filter(x => x !== cat);
                            return [...prev, cat];
                          });
                        }}
                      />
                      <span>{cat}</span>
                    </label>
                  )) : (
                    <div style={{ padding: 8, color: '#666' }}>No categories available</div>
                  )}
                </div>
              )}
            </div>

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
