import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { fetchSkillById } from "../api/skills";

export default function DraftRequest() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const skillId = params.get("skillId") || "";
  const [skill, setSkill] = useState(null);
  const [owner, setOwner] = useState("");
  const [aboutYou, setAboutYou] = useState("");

  useEffect(() => {
    let ignore = false;
    if (skillId) {
      fetchSkillById(skillId)
        .then((s) => {
          if (ignore) return;
          setSkill(s);
          setOwner(s.ownerName || "Skill owner");
        })
        .catch(() => setSkill(null));
    }
    return () => { ignore = true; };
  }, [skillId]);

  function handleSubmit(e) {
    e.preventDefault();
    console.log("REQUEST:", { to: owner, skillId, aboutYou });
    alert("Request sent (mock).");
    nav("/requests");
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Send Skill Request</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            To:
            <input
              style={styles.input}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder={`To: ${skill?.name || "Skill"} owner`}
            />
          </label>

          <label style={styles.label}>
            Interested in skill:
            <div style={styles.skillBox}>{skill?.name || "(unknown skill)"}</div>
          </label>

          <label style={styles.label}>
            Say something about yourself:
            <textarea
              style={styles.textarea}
              rows={6}
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
              placeholder="Briefly introduce yourself and what you need…"
              required
            />
          </label>

          <button type="submit" style={styles.button}>Send Request</button>

          <Link to={`/skills/${skillId}`} style={styles.backLink}>← Back</Link>

        </form>
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
    background: "#f7f7f7",
  },
  container: {
    background: "#fff",
    padding: "40px 50px",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: 600,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
    fontWeight: "600",
    color: "#222",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },
  input: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  skillBox: {
    marginTop: 8,
    background: "#f0f0f0",
    padding: "12px 14px",
    borderRadius: 8,
    fontSize: 16,
  },
  textarea: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    resize: "vertical",
  },
  button: {
    background: "#007bff",
    color: "#fff",
    padding: "14px",
    fontSize: 18,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "0.2s",
  },
  backLink: {
    marginTop: 20,
    textAlign: "center",
    display: "block",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: 500,
  },
};
