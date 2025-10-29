// React Router hooks/components for reading URL params, navigating, and linking
import { useParams, Link, useNavigate } from "react-router-dom";

// In-memory data helper (no network calls). See src/skills.js
import { getSkillById } from "./skills";

// Importing CSS for styling
import "./SkillDescription.css";

export default function SkillDescription() {
  // Grab the ":id" from the route /skills/:id (e.g., "python", "public-speaking")
  const { id } = useParams();

  // For programmatic navigation (e.g., when clicking "Draft Request")
  const nav = useNavigate();

  // Look up the skill synchronously from our local array
  const skill = getSkillById(id);

  // If the id is unknown, show a friendly message with a way back
  if (!skill) {
    return (
      <div className="page">
        <div className="card">
          <p>Skill not found.</p>
          <Link to="/home" className="back">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // Main UI: show image, description, and a button to draft a request.
  // The "Draft Request" button passes the current skill id in the query string.
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">{skill.name}</h1>
        {/* Skill media pulled from public/images via Home -> skills.js */}
        <img src={skill.img} alt={skill.name} className="image" />
        {/* If no description is set yet, show a short placeholder */}
        <p className="description">
          {skill.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </p>
        {/* Navigate to the Draft Request screen with this skill preselected */}
        <button
          onClick={() => nav(`/requests/new?skillId=${encodeURIComponent(skill.id)}`)}
          className="button"
        >
          Draft Request
        </button>
        {/* Simple way back to the grid */}
        <Link to="/home" className="back">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
