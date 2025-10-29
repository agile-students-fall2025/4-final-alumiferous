import { useParams, Link, useNavigate } from "react-router-dom";
import { skills } from "../data/skills";

export default function SkillDescription() {
  const { id } = useParams();
  const nav = useNavigate();

  const skill = skills.find((s) => s.id === id);

  if (!skill) {
    return (
      <div style={{ padding: 20 }}>
        <p>Skill not found.</p>
        <Link to="/home">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{skill.name}</h1>
        <img src={skill.img} alt={skill.name} style={styles.image} />
        <p style={styles.description}>{skill.description}</p>

        <button
          onClick={() => nav(`/requests/new?skillId=${encodeURIComponent(skill.id)}`)}
          style={styles.button}
        >
          Draft Request
        </button>

        <Link to="/home" style={styles.back}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

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
  title: {
    fontSize: 32,
    marginBottom: 24,
    color: "#222",
  },
  image: {
    width: "100%",
    maxHeight: 400,
    borderRadius: 10,
    objectFit: "cover",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#444",
  },
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
  back: {
    display: "block",
    marginTop: 16,
    textDecoration: "none",
    color: "#007bff",
  },
};
