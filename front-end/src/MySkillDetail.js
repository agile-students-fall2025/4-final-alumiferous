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
          console.log('Checking skill:', s, 'IDs:', s.skillId, s.id, s._id);
          console.log('Comparison:', Number(s.skillId) === Number(id), Number(s.id) === Number(id));
          return Number(s.skillId) === Number(id) || 
                 Number(s.id) === Number(id) || 
                 Number(s._id) === Number(id);
        }
      );
      console.log('Found skill:', foundSkill);
      setSkill(foundSkill);
    }
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

  return (
    <div className="skill-detail-container">
      <button className="back-button" onClick={() => navigate('/profile')}>
        ←
      </button>
      
      <div className="skill-detail-card">
        <h1 className="skill-title">{skill.name}</h1>
        
        <div className="field-tag">{skill.category || skill.field || 'Not specified'}</div>
        
        <div className="skill-info">
          <div className="info-section">
            <h3>Description</h3>
            <p>{skill.description || skill.detail || skill.brief || 'No description provided'}</p>
          </div>
          
          {skill.videoUrl && (
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
