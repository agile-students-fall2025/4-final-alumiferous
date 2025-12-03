import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MySkillDetail.css';

export default function MySkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkill, setEditedSkill] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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

  // Initialize edited skill when entering edit mode
  useEffect(() => {
    if (isEditing && skill) {
      // Deduplicate images and videos arrays
      const uniqueImages = skill.images ? [...new Set(skill.images)] : [];
      const uniqueVideos = skill.videos ? [...new Set(skill.videos)] : [];
      
      setEditedSkill({
        name: skill.name || '',
        brief: skill.brief || '',
        detail: skill.detail || skill.description || '',
        categories: skill.categories || [],
        images: uniqueImages,
        videos: uniqueVideos
      });
    }
  }, [isEditing, skill]);

  useEffect(() => {
    // Get user skills from localStorage
    const userSkillsString = localStorage.getItem('userSkills');
    console.log('Looking for skill ID:', id, 'Type:', typeof id);
    console.log('LocalStorage userSkills:', userSkillsString);
    
    if (userSkillsString) {
      const userSkills = JSON.parse(userSkillsString);
      console.log('Parsed skills:', userSkills);
      
      // Find the skill by ID (could be skillId, id, or _id)
      const foundSkill = userSkills.find(
        s => {
          const skillIdStr = String(s.skillId || s.id || s._id || '');
          const paramIdStr = String(id);
          console.log('Checking skill:', s.name, 'skillId:', skillIdStr, 'vs param:', paramIdStr);
          return skillIdStr === paramIdStr;
        }
      );
      console.log('Found skill:', foundSkill);
      
      if (foundSkill) {
        setSkill(foundSkill);
        return;
      }
    }
    
    // If not found in localStorage, try fetching from API
    console.log('Skill not in localStorage, fetching from API...');
    fetch(`/api/skills/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Skill not found');
        return res.json();
      })
      .then(data => {
        console.log('Fetched skill from API:', data);
        setSkill(data);
      })
      .catch(err => {
        console.error('Error fetching skill:', err);
        setSkill(null);
      });
  }, [id]);

  // Handle save skill edits
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      
      console.log('Saving skill with ID:', id);
      console.log('Edited skill data:', editedSkill);
      
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
      
      // Send list of removed media URLs
      if (removedImages.length > 0) {
        formData.append('removedImages', removedImages.join(','));
      }
      if (removedVideos.length > 0) {
        formData.append('removedVideos', removedVideos.join(','));
      }

      console.log('Sending PUT request to:', `${apiUrl}/api/skills/${id}`);
      
      const response = await fetch(`${apiUrl}/api/skills/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to update skill (${response.status})`);
      }

      const responseData = await response.json();
      console.log('Update successful! Response data:', responseData);

      // Clear caches to force fresh data on reload
      localStorage.removeItem('skills');
      localStorage.removeItem('userSkills');
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating skill:', error);
      alert(`Failed to update skill: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSkill(null);
    setNewImages([]);
    setNewVideos([]);
    setRemovedImages([]);
    setRemovedVideos([]);
    setCatsOpen(false);
  };

  if (!skill) {
    return (
      <div className="skill-detail-container">
        <div className="skill-not-found">
          <h2>Skill not found</h2>
          <button onClick={() => navigate('/profile')}>Back to Profile</button>
        </div>
      </div>
    );
  }

  // Parse categories (could be array or comma-separated string)
  let categories = [];
  if (Array.isArray(skill.categories)) {
    categories = skill.categories.filter(Boolean);
  } else if (typeof skill.categories === 'string' && skill.categories.trim()) {
    categories = skill.categories.split(',').map(c => c.trim()).filter(Boolean);
  }
  
  console.log('Skill data:', skill);
  console.log('Categories raw:', skill.categories);
  console.log('Categories parsed:', categories);
  console.log('Images:', skill.images);
  console.log('Videos:', skill.videos);
  
  // Get images and videos arrays
  const images = skill.images || [];
  const videos = skill.videos || [];

  return (
    <div className="skill-detail-container">
      <button className="back-button" onClick={() => navigate('/profile')}>
        ←
      </button>
      
      <div className="skill-detail-card">
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                className="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                style={{ padding: '10px 20px', fontSize: '16px' }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{ background: '#666', padding: '10px 20px', fontSize: '16px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="skill-title">{skill.name}</h1>
            
            {/* All Categories */}
            {categories.length > 0 && (
              <div className="categories-list">
                {categories.map((cat, idx) => (
                  <span key={idx} className="category-badge">{cat}</span>
                ))}
              </div>
            )}
        
        <div className="skill-info">
          {/* Description */}
          <div className="info-section">
            <h3>Description</h3>
            <p>{skill.detail || skill.description || skill.brief || 'No description provided'}</p>
          </div>
          
          {/* Images Gallery */}
          {images.length > 0 && (
            <div className="info-section">
              <h3>Images</h3>
              <div className="media-gallery">
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt={`${skill.name} ${idx + 1}`} className="gallery-image" />
                ))}
              </div>
            </div>
          )}
          
          {/* Videos Gallery */}
          {videos.length > 0 && (
            <div className="info-section">
              <h3>Videos</h3>
              <div className="video-gallery">
                {videos.map((vid, idx) => (
                  <div key={idx} className="video-container">
                    <video controls width="100%">
                      <source src={vid} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback single videoUrl */}
          {!videos.length && skill.videoUrl && (
            <div className="info-section">
              <h3>Video</h3>
              <div className="video-container">
                <video controls width="100%">
                  <source src={skill.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>
        
        {/* Edit Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="button"
            onClick={() => setIsEditing(true)}
            style={{ padding: '10px 20px', fontSize: '16px' }}
          >
            Edit Skill
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
