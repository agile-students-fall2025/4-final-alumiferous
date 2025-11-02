import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./SkillDescription.css";

export default function SkillDescription() {
  // URL like /skills/5 → we read "5"
  const { id } = useParams();
  const nav = useNavigate();

  // local state for this page
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First try to read what Home already cached
    const cached = localStorage.getItem("skills");
    if (cached) {
      const parsed = JSON.parse(cached);

      // find this exact skill by id
      const found = parsed.find(
        (s) => String(s.skillId) === String(id)
      );

      setSkill(found || null);
      setLoading(false);
      return;
    }

    // 2. Fallback for direct navigation (user goes straight to /skills/5 without visiting Home)
    async function fetchFromMockaroo() {
      try {
        const res = await fetch("https://my.api.mockaroo.com/skills.json?key=4e009220");
        const data = await res.json();

        // match Home.jsx behavior: add width/height so picsum works
        const updatedData = data.map((s) => ({
          ...s,
          width: Math.floor(Math.random() * 80) + 150,
          height: Math.floor(Math.random() * 100) + 200,
        }));

        // cache it so we don't refetch next time
        localStorage.setItem("skills", JSON.stringify(updatedData));

        // find the right skill again
        const found = updatedData.find(
          (s) => String(s.skillId) === String(id)
        );

        setSkill(found || null);
      } catch (err) {
        console.error("Failed to fetch skills for detail page:", err);
        setSkill(null);
      } finally {
        setLoading(false);
      }
    }

    fetchFromMockaroo();
  }, [id]);

  // ---- loading state ----
  if (loading) {
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
