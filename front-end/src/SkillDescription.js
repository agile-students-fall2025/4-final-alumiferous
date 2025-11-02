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

  // Use the same image logic as Home.js: use skill.image if present, otherwise use picsum fallback
  // Always use the same image logic as Home.js for consistency
  const finalImageSrc = `//picsum.photos/${skill.width}/${skill.height}?random=${skill.skillId}`;

  return (
    <div className="page">
      <div className="card">
        {/* Skill name */}
        <h1 className="title">{skill.name}</h1>

        {/* Hero image */}
        <img
          src={finalImageSrc}
          alt={skill.name}
          className="image"
        />

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

        {/* Draft Request button.
           VERY IMPORTANT:
           We pass what the next page will need using the same keys:
           - skillId (number)
           - name (string)
           - username (string, who owns it)
           You can also pass category if your request form needs it.
        */}
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
