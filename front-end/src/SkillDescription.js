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
  const finalImageSrc = skill.image || null;

  return (
    <div className="page">
      <div className="card">
        {/* Skill name */}
        <h1 className="title">{skill.name}</h1>

        {/* Hero image (render only when backend provided an image) */}
        {finalImageSrc && (
          <img
            src={finalImageSrc}
            alt={skill.name}
            className="image"
          />
        )}

        {/* Long description (detail from Mockaroo).
            If detail is empty for that row, fall back to brief. */}
        <p className="description">
          {skill.detail || skill.brief || "No description provided yet."}
        </p>

        {/* Extra metadata */}
        <div className="meta">
          <p>
            <strong>Category:</strong> {skill.category || "—"}
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
