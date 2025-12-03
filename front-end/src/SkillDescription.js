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

  // Find the skill by id
  const skill = useMemo(() => {
    return skills.find((s) => String(s.skillId) === String(id));
  }, [skills, id]);

  // Check if user already sent a request for this skill
  useEffect(() => {
    const checkExistingRequest = async () => {
      const currentUserId = localStorage.getItem('userId');
      
      if (!currentUserId || !id) {
        setCheckingRequest(false);
        return;
      }

      try {
        const response = await fetch(`/api/requests/check?skillId=${id}&requesterId=${currentUserId}`);
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
      </div>
    </div>
  );
}
