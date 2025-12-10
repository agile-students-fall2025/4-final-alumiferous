import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { SkillsContext } from "./SkillsContext";

export default function SkillDescription() {
  // URL like /skills/5 → we read "5"
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();

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

      setCheckingRequest(true);
      console.log('Checking for existing request...', { skillId: id, userId: currentUserId });
      
      try {
        const response = await fetch(`/api/requests/check?skillId=${id}&requesterId=${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Request check result:', data);
          setRequestExists(data.exists);
        }
      } catch (error) {
        console.error('Error checking for existing request:', error);
      } finally {
        setCheckingRequest(false);
      }
    };

    checkExistingRequest();
  }, [id, location.key]); // Re-run when id OR navigation key changes

  // ---- loading state ----
  if (!skills || skills.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="card">
          <p className="text-center text-gray-500 dark:text-gray-400">Loading skill...</p>
        </div>
      </div>
    );
  }

  // ---- not found / bad id ----
  if (!skill) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="card">
          <p className="text-center text-gray-500 dark:text-gray-400">Skill not found.</p>
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

  const handleBack = () => {
    // Check if we came from a specific page via location state
    if (location.state?.from) {
      nav(location.state.from);
    } else {
      // Default to home to avoid loops
      nav('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] px-4 py-6 pt-[77px] pb-20">
      <div className="card max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center mb-4 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Skill name (from offering) */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{skill.name}</h1>

        {/* Slideshow for images and videos */}
        {allMedia.length > 0 && (
          <div className="mb-6">
            <div className="relative rounded-app overflow-hidden bg-gray-100 dark:bg-gray-800">
              {allMedia[currentIndex].type === 'image' ? (
                <img
                  src={allMedia[currentIndex].src}
                  alt={`${skill.name} ${currentIndex + 1}`}
                  className="w-full h-auto max-h-96 object-cover"
                />
              ) : (
                <video controls className="w-full h-auto max-h-96" key={currentIndex}>
                  <source src={allMedia[currentIndex].src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Navigation buttons - only show if more than 1 item */}
              {allMedia.length > 1 && (
                <>
                  <button 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10" 
                    onClick={prevSlide}
                    aria-label="Previous"
                  >
                    ❮
                  </button>
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10" 
                    onClick={nextSlide}
                    aria-label="Next"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail gallery */}
            {allMedia.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {allMedia.map((media, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-16 h-16 rounded-app overflow-hidden cursor-pointer border-2 transition-all ${
                      idx === currentIndex ? 'border-primary' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {media.type === 'image' ? (
                      <img src={media.src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-2xl">
                        <span>▶</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Long description (detail from offering).
            If detail is empty for that row, fall back to brief. */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {skill.detail || skill.brief || "No description provided yet."}
        </p>

        {/* Extra metadata */}
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="font-semibold">Categories:</strong>{" "}
            {skill.categories && skill.categories.length > 0 ? (
              <span className="inline-flex flex-wrap gap-2 ml-2">
                {skill.categories.map((cat, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {cat}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="font-semibold">Posted by:</strong>{" "}
            {(() => {
              const currentUserId = localStorage.getItem('userId');
              const isOwnSkill = String(currentUserId) === String(skill.userId);
              if (isOwnSkill) {
                return <span className="font-medium">You</span>;
              }
              if (skill.userId) {
                return (
                  <button
                    className="inline-flex items-center px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      nav(`/users/${skill.userId}`);
                    }}
                  >
                    {skill.username || "anonymous"}
                  </button>
                );
              }
              return skill.username || "anonymous";
            })()}
          </p>
        </div>

        {/* Check if this is the user's own skill */}
        {(() => {
          const currentUserId = localStorage.getItem('userId');
          const isOwnSkill = String(currentUserId) === String(skill.userId);
          
          if (isOwnSkill) {
            return null; // Don't show button for own skills
          }
          
          return (
            <>
              <button
                className="btn btn-primary w-full"
                disabled={checkingRequest || requestExists}
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
                {checkingRequest ? 'Checking...' : (requestExists ? 'Request Already Sent' : 'Request to Learn')}
              </button>
              {requestExists && (
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
                  You have already sent a request for this skill
                </p>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
