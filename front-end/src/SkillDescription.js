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
  const [isEditing] = useState(false);
  const [editedSkill, setEditedSkill] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [removedVideos, setRemovedVideos] = useState([]);
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

  // Check if the skill belongs to the current user
  const isOwnSkill = skill && currentUserId && String(skill.userId) === String(currentUserId);

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
  
  // Only use skill.images array, ignore skill.image to prevent duplication
  const images = Array.isArray(skill.images) && skill.images.length > 0 ? skill.images : [];
  const videos = Array.isArray(skill.videos) ? skill.videos : [];
  
  // Deduplicate to avoid showing the same media multiple times
  const uniqueImages = [...new Set(images.filter(Boolean))];
  const uniqueVideos = [...new Set(videos.filter(Boolean))];
  
  // Combine images and videos into one media array
  const allMedia = [
    ...uniqueImages.map(img => ({ type: 'image', src: img })),
    ...uniqueVideos.map(vid => ({ type: 'video', src: vid }))
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
                          <span>▶️</span>
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
            
            {/* Existing Images */}
            <div style={{ marginBottom: '15px' }}>
              <strong>Current Images:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {editedSkill?.images && editedSkill.images.length > 0 ? (
                  editedSkill.images
                    .filter(img => !removedImages.includes(img))
                    .map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <img 
                          src={img} 
                          alt={`Current ${idx}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                        />
                        <button
                          type="button"
                          onClick={() => setRemovedImages([...removedImages, img])}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))
                ) : (
                  <small style={{ color: '#666', fontStyle: 'italic' }}>No images yet</small>
                )}
              </div>
            </div>

            {/* Add New Images */}
            <label style={{ display: 'block', marginBottom: '15px' }}>
              <strong>Add New Images:</strong>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
              {newImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {newImages.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`New ${idx}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4CAF50' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Remove from upload"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </label>

            {/* Existing Videos */}
            <div style={{ marginBottom: '15px' }}>
              <strong>Current Videos:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {editedSkill?.videos && editedSkill.videos.length > 0 ? (
                  editedSkill.videos
                    .filter(vid => !removedVideos.includes(vid))
                    .map((vid, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '160px', height: '100px' }}>
                        <video 
                          src={vid} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                          muted
                        />
                        <button
                          type="button"
                          onClick={() => setRemovedVideos([...removedVideos, vid])}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Remove video"
                        >
                          ×
                        </button>
                      </div>
                    ))
                ) : (
                  <small style={{ color: '#666', fontStyle: 'italic' }}>No videos yet</small>
                )}
              </div>
            </div>

            {/* Add New Videos */}
            <label style={{ display: 'block', marginBottom: '15px' }}>
              <strong>Add New Videos:</strong>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => setNewVideos([...newVideos, ...Array.from(e.target.files)])}
                style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '16px' }}
              />
              {newVideos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {newVideos.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '160px', height: '100px' }}>
                      <video 
                        src={URL.createObjectURL(file)} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4CAF50' }}
                        controls
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => setNewVideos(newVideos.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Remove from upload"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                <strong>Posted by:</strong> {isOwnSkill ? "You" : (skill.username || "Unknown User")}
              </p>
            </div>
          </>
        )}

        {/* Only show Draft Request button if it's NOT the user's own skill */}
        {!isOwnSkill && (
          <>
            {checkingRequest ? (
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
          </>
        )}
      </div>
    </div>
  );
}