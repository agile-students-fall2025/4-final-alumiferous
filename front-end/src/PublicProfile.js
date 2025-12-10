import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PublicProfile.css';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSkillClick = (skillId) => {
    navigate(`/skills/${skillId}`);
  };

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-page">
        <div className="error">{error || 'Profile not found'}</div>
        <button className="back-button" onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    );
  }

  const displayName = profile.username || 
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 
    'User';

  return (
    <div className="public-profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-photo-section">
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt={displayName}
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{displayName}</h1>
            {profile.bio && (
              <p className="profile-bio">{profile.bio}</p>
            )}
            <div className="profile-stats">
              <span className="stat-item">
                <strong>{profile.skillCount || 0}</strong> Skills
              </span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="skills-section">
          <h2 className="section-title">Skills</h2>
          
          {profile.skills && profile.skills.length > 0 ? (
            <div className="skills-grid">
              {profile.skills.map((skill) => (
                <div 
                  key={skill.skillId} 
                  className="skill-card"
                  onClick={() => handleSkillClick(skill.skillId)}
                >
                  {skill.image && (
                    <div className="skill-image-container">
                      <img 
                        src={skill.image} 
                        alt={skill.name}
                        className="skill-image"
                      />
                    </div>
                  )}
                  <div className="skill-content">
                    <h3 className="skill-name">{skill.name}</h3>
                    {skill.brief && (
                      <p className="skill-brief">{skill.brief}</p>
                    )}
                    {skill.categories && skill.categories.length > 0 && (
                      <div className="skill-categories">
                        {skill.categories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="category-badge">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-skills">
              <p>This user hasn't shared any skills yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
