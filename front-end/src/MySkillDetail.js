import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MySkillDetail.css';

export default function MySkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);

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
        <h1 className="skill-title">{skill.name}</h1>
        
        {/* Main Category */}
        {skill.category && (
          <div className="field-tag">{skill.category}</div>
        )}
        
        {/* All Categories */}
        {categories.length > 0 && (
          <div className="info-section">
            <h3>Categories</h3>
            <div className="categories-list">
              {categories.map((cat, idx) => (
                <span key={idx} className="category-badge">{cat}</span>
              ))}
            </div>
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
      </div>
    </div>
  );
}
