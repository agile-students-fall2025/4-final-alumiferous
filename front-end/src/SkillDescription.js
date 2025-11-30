import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SkillsContext } from "./SkillsContext";
import "./SkillDescription.css";

export default function SkillDescription() {
  // URL like /skills/5 → we read "5"
  const { id } = useParams();
  const nav = useNavigate();

  // Get skills from context
  const { skills } = useContext(SkillsContext);

  // Find the skill by id
  const skill = useMemo(() => {
    return skills.find((s) => String(s.skillId) === String(id));
  }, [skills, id]);

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
  // If the skill has multiple images, show the first one as hero and the rest as gallery
  const images = Array.isArray(skill.images) && skill.images.length > 0 ? skill.images : (skill.image ? [skill.image] : []);
  const heroImage = images[0] || null;
  const galleryImages = images.length > 1 ? images.slice(1) : [];

  return (
    <div className="page">
      <div className="card">
        {/* Skill name (from offering) */}
        <h1 className="title">{skill.name}</h1>

        {/* Hero image (render only when backend provided an image) */}
        {heroImage && (
          <img
            src={heroImage}
            alt={skill.name}
            className="image"
          />
        )}

        {/* Gallery images if present */}
        {galleryImages.length > 0 && (
          <div className="gallery">
            {galleryImages.map((img, idx) => (
              <img key={idx} src={img} alt={`${skill.name} ${idx + 2}`} className="gallery-image" />
            ))}
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
            <strong>Posted by:</strong> {skill.username || "anonymous"}
          </p>
        </div>

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
      </div>
    </div>
  );
}
