import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SkillsContext } from "./SkillsContext";
import "./SkillDescription.css";

export default function SkillDescription() {
  // URL like /skills/5 → we read "5"
  const { id } = useParams();
  const nav = useNavigate();

  // Get skills from context
  const { skills } = useContext(SkillsContext);

  // State for slideshow - MUST be at top level before any returns
  const [currentIndex, setCurrentIndex] = useState(0);
  const [requestExists, setRequestExists] = useState(false);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkill, setEditedSkill] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = React.useRef(null);

  // Fetch available categories
  useEffect(() => {
    (async function fetchCategories(){
      try {
        const res = await fetch('/api/fixeddata');
        if (res.ok) {
          const body = await res.json();
          const c = Array.isArray(body.categories) ? body.categories : [];
          if (c.length) setAvailableCategories(c.sort());
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    })();

    // Click-away handler for categories dropdown
    function onDocClick(e){
      if (catsRef.current && !catsRef.current.contains(e.target)) {
        setCatsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => { document.removeEventListener('click', onDocClick); };
  }, []);

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  // Find the skill by id
  const skill = useMemo(() => {
    return skills.find((s) => String(s.skillId) === String(id));
  }, [skills, id]);

  // Check if user already sent a request for this skill
  useEffect(() => {
    const checkExistingRequest = async () => {
      const userId = localStorage.getItem('userId');
      
      if (!userId || !id) {
        setCheckingRequest(false);
        return;
      }

      try {
        const response = await fetch(`/api/requests/check?skillId=${id}&requesterId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRequestExists(data.exists);
        }
      } catch (error) {
        console.error('Error checking for existing request:', error);
      } finally {
        setCheckingRequest(false);
      }
    };

    checkExistingRequest();
  }, [id]);

  // Initialize edited skill when entering edit mode
  useEffect(() => {
    if (isEditing && skill) {
      setEditedSkill({
        name: skill.name || '',
        brief: skill.brief || '',
        detail: skill.detail || '',
        categories: skill.categories || [],
        images: skill.images || [],
        videos: skill.videos || []
      });
    }
  }, [isEditing, skill]);

  // Handle save skill edits
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      
      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append('name', editedSkill.name);
      formData.append('brief', editedSkill.brief);
      formData.append('detail', editedSkill.detail);
      if (editedSkill.categories && editedSkill.categories.length) {
        formData.append('categories', editedSkill.categories.join(','));
      }
      
      // Append new image files
      if (newImages && newImages.length) {
        newImages.forEach(file => formData.append('images', file));
      }
      
      // Append new video files
      if (newVideos && newVideos.length) {
        newVideos.forEach(file => formData.append('videos', file));
      }

      const response = await fetch(`${apiUrl}/api/skills/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update skill');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSkill(null);
    setNewImages([]);
    setNewVideos([]);
    setCatsOpen(false);
  };

  // ---- loading state ----
  if (!skills || skills.length === 0) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading skill...</p>
        </div>
      </div>
    );
  }

  // ---- not found / bad id ----
  if (!skill) {
    return (
      <div className="page">
        <div className="card">
          <p>Skill not found.</p>
        </div>
      </div>
    );
  }

  // Use the image provided by the backend when available. Per product decision,
  // do NOT use external placeholder images; if `skill.image` is missing, omit the hero image.
  // Combine all media (images and videos) into a slideshow
  const images = Array.isArray(skill.images) && skill.images.length > 0 ? skill.images : (skill.image ? [skill.image] : []);
  const videos = Array.isArray(skill.videos) ? skill.videos : [];
  
  // Combine images and videos into one media array
  const allMedia = [
    ...images.map(img => ({ type: 'image', src: img })),
    ...videos.map(vid => ({ type: 'video', src: vid }))
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <div className="page">
      <div className="card">
        {/* Skill name (from offering) */}
        <h1 className="title">{skill.name}</h1>

        {/* Slideshow for images and videos */}
        {allMedia.length > 0 && (
          <div className="slideshow">
            <div className="slideshow-container">
              {allMedia[currentIndex].type === 'image' ? (
                <img
                  src={allMedia[currentIndex].src}
                  alt={`${skill.name} ${currentIndex + 1}`}
                  className="slide-image"
                />
              ) : (
                <video controls className="slide-video" key={currentIndex}>
                  <source src={allMedia[currentIndex].src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Navigation buttons - only show if more than 1 item */}
            {allMedia.length > 1 && (
              <>
                <button className="slide-btn prev" onClick={prevSlide}>❮</button>
                <button className="slide-btn next" onClick={nextSlide}>❯</button>
                
                {/* Thumbnail gallery */}
                <div className="thumbnail-gallery">
                  {allMedia.map((media, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(idx)}
                    >
                      {media.type === 'image' ? (
                        <img src={media.src} alt={`Thumbnail ${idx + 1}`} />
                      ) : (
                        <div className="video-thumbnail">
                          <span>▶</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Long description (detail from offering).
            If detail is empty for that row, fall back to brief. */}
        {isEditing ? (
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Skill Name:</strong>
              <input
                type="text"
                value={editedSkill?.name || ''}
                onChange={(e) => setEditedSkill({...editedSkill, name: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Brief Description:</strong>
              <textarea
                value={editedSkill?.brief || ''}
                onChange={(e) => setEditedSkill({...editedSkill, brief: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Detailed Description:</strong>
              <textarea
                value={editedSkill?.detail || ''}
                onChange={(e) => setEditedSkill({...editedSkill, detail: e.target.value})}
                rows={6}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Categories:</strong>
              <div ref={catsRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '5px', 
                    fontSize: '16px',
                    textAlign: 'left',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCatsOpen((s) => !s)}
                >
                  {editedSkill?.categories?.length === 0 || !editedSkill?.categories
                    ? 'Select categories...'
                    : editedSkill.categories.join(', ')}
                </button>

                {catsOpen && (
                  <div style={{ 
                    position: 'absolute', 
                    zIndex: 40, 
                    background: 'white', 
                    border: '1px solid #ddd', 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    width: '100%', 
                    marginTop: '6px', 
                    padding: '8px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {availableCategories && availableCategories.length ? availableCategories.map((cat, index) => (
                      <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editedSkill?.categories?.includes(cat) || false}
                          onChange={() => {
                            const currentCats = editedSkill?.categories || [];
                            if (currentCats.includes(cat)) {
                              setEditedSkill({...editedSkill, categories: currentCats.filter(c => c !== cat)});
                            } else {
                              setEditedSkill({...editedSkill, categories: [...currentCats, cat]});
                            }
                          }}
                        />
                        <span>{cat}</span>
                      </label>
                    )) : (
                      <div style={{ padding: '8px', color: '#666' }}>No categories available</div>
                    )}
                  </div>
                )}
              </div>
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Add Images:</strong>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files))}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
              {newImages.length > 0 && <small>{newImages.length} image(s) selected</small>}
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Add Videos:</strong>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => setNewVideos(Array.from(e.target.files))}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
              {newVideos.length > 0 && <small>{newVideos.length} video(s) selected</small>}
            </label>
          </div>
        ) : (
          <>
            <p className="description">
              {skill.detail || skill.brief || "No description provided yet."}
            </p>

            {/* Extra metadata */}
            <div className="meta">
              <p>
                <strong>Categories:</strong>{" "}
                {skill.categories && skill.categories.length > 0 ? (
                  <span className="categories-list">
                    {skill.categories.map((cat, idx) => (
                      <span key={idx} className="category-tag">
                        {cat}
                      </span>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <strong>Posted by:</strong> {skill.username || "Unknown User"}
              </p>
            </div>
          </>
        )}

        {/* Show Edit button if user owns this skill, otherwise show Draft Request */}
        {currentUserId && currentUserId === skill.userId ? (
          isEditing ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{ background: '#666' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="button"
              onClick={() => setIsEditing(true)}
            >
              Edit Skill
            </button>
          )
        ) : checkingRequest ? (
          <button className="button" disabled>
            Checking...
          </button>
        ) : requestExists ? (
          <div className="request-already-sent">
            <p>✓ Request Already Sent</p>
            <small>You have already sent a request for this skill</small>
          </div>
        ) : (
          <button
            className="button"
            onClick={() =>
              nav(
                `/requests/new?skillId=${encodeURIComponent(
                  skill.skillId
                )}&skillName=${encodeURIComponent(
                  skill.name
                )}&owner=${encodeURIComponent(
                  skill.username || ""
                )}&ownerId=${encodeURIComponent(
                  skill.userId || ""
                )}&category=${encodeURIComponent(
                  skill.category || ""
                )}`
              )
            }
          >
            Draft Request
          </button>
        )}
      </div>
    </div>
  );
}
