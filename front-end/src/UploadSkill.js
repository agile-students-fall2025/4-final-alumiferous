import React, { useState, useEffect, useContext } from "react";
import { SkillsContext } from "./SkillsContext";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function UploadSkill() {
  const { skills } = useContext(SkillsContext);
  const { refreshFeed, prependSkill } = useContext(SkillsContext);
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
      
      // Update the home feed: prepend the new skill and refresh page 1 to revalidate counts
      try {
        if (prependSkill) prependSkill(savedSkill);
        if (refreshFeed) refreshFeed();
      } catch (e) {
        console.warn('Failed to refresh feed after upload', e);
      }

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
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-[65px]">
      <header className="fixed top-[65px] left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => window.history.back()} aria-label="Back">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Upload</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-4 py-6 pt-[72px] pb-20">
        <div className="max-w-2xl mx-auto">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* General skill selection (canonical grouping) */}
            <label htmlFor="generalSkill" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Skill (general)</label>
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
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories (select one or more)</label>
            <div className="multi-select" ref={catsRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="form-input text-left"
                onClick={() => setCatsOpen((s) => !s)}
                aria-haspopup="listbox"
                aria-expanded={catsOpen}
              >
                {selectedCategories.length === 0 ? 'Select categories...' : selectedCategories.join(', ')}
              </button>

              {catsOpen && (
                <div className="absolute z-40 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#333] rounded-app shadow-lg max-h-56 overflow-y-auto w-full mt-1.5 p-2" style={{ maxHeight: 220 }}>
                  {categories && categories.length ? categories.map((cat, index) => (
                    <label key={index} className="flex items-center gap-2 py-1.5 px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => {
                          setSelectedCategories(prev => {
                            if (prev.includes(cat)) return prev.filter(x => x !== cat);
                            return [...prev, cat];
                          });
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                    </label>
                  )) : (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No categories available</div>
                  )}
                </div>
              )}
            </div>

            {/* Skill name */}
            <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name</label>
            <input
              id="skillName"
              type="text"
              className="form-input"
              placeholder="e.g. Graphic Design"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />

            {/* Description */}
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description / Expertise</label>
            <textarea
              id="description"
              className="form-input"
              placeholder="Describe your experience, projects, or strengths in this skill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Images input */}
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Images</label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-app file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-blue-700 cursor-pointer"
            />

            {images && images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((f, idx) => (
                  <img key={idx} src={URL.createObjectURL(f)} alt={`preview-${idx}`} className="w-20 h-20 object-cover rounded-app" />
                ))}
              </div>
            )}

            {/* Video input (multiple) */}
            <label htmlFor="videos" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Demo Videos</label>
            <input
              id="videos"
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideosChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-app file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-blue-700 cursor-pointer"
            />

            {videos && videos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {videos.map((f, idx) => (
                  <video key={idx} controls className="w-40 h-40 rounded-app" src={URL.createObjectURL(f)} />
                ))}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Submit
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm text-primary font-medium">{message}</p>}
        </div>
      </div>
    </div>
  );
}
