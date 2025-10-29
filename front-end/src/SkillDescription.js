// src/SkillDescription.js

// React Router hooks/components for reading URL params, navigating, and linking
import { useParams, Link, useNavigate } from "react-router-dom";

// In-memory data helper (no network calls). See src/skills.js
import { getSkillById } from "./skills";

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
      <div style={{ padding: 20 }}>
        <p>Skill not found.</p>
        <Link to="/home">← Back to Home</Link>
      </div>
    );
  }

  // Main UI: show image, description, and a button to draft a request.
  // The "Draft Request" button passes the current skill id in the query string.
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{skill.name}</h1>

        {/* Skill media pulled from public/images via Home -> skills.js */}
        <img src={skill.img} alt={skill.name} style={styles.image} />

        {/* If no description is set yet, show a short placeholder */}
        <p style={styles.description}>
          {skill.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </p>

        {/* Navigate to the Draft Request screen with this skill preselected */}
        <button
          onClick={() => nav(`/requests/new?skillId=${encodeURIComponent(skill.id)}`)}
          style={styles.button}
        >
          Draft Request
        </button>

        {/* Simple way back to the grid */}
        <Link to="/home" style={styles.back}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

// Inline styles for quick iteration in the sprint.
// In production we might move these into a CSS module or Tailwind.
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7f8fa",
    padding: "40px 20px",
  },
  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 10,
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    maxWidth: 700,
    textAlign: "center",
  },
  title: { fontSize: 32, marginBottom: 24, color: "#222" },
  image: {
    width: "100%",
    maxHeight: 400,
    borderRadius: 10,
    objectFit: "cover",
    marginBottom: 20,
  },
  description: { fontSize: 16, lineHeight: 1.6, color: "#444" },
  button: {
    marginTop: 24,
    padding: "14px 28px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 18,
    cursor: "pointer",
  },
  back: { display: "block", marginTop: 16, textDecoration: "none", color: "#007bff" },
};
