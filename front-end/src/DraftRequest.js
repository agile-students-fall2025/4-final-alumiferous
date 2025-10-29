// src/DraftRequest.js

// React hooks: component state + side effects
import { useEffect, useState } from "react";
// React Router: navigation, reading query params, and linking
import { useNavigate, useSearchParams, Link } from "react-router-dom";
// In-memory skills helper (no network calls). See src/skills.js
import { getSkillById } from "./skills";

export default function DraftRequest() {
  // Read ?skillId=... from the URL (e.g., /requests/new?skillId=python)
  const [params] = useSearchParams();
  // For programmatic navigation after submit or when going back
  const nav = useNavigate();

  // The selected skill id from the query string
  const skillId = params.get("skillId") || "";

  // Local UI state
  const [skill, setSkill] = useState(null);     // the selected skill's full object
  const [owner, setOwner] = useState("");       // who we are addressing (mocked for now)
  const [aboutYou, setAboutYou] = useState(""); // request body typed by the user

  // When skillId changes, look up the skill synchronously from our in-memory list
  // (No async/fetch in this sprint; keeps things simple for the demo)
  useEffect(() => {
    // synchronous lookup; no async/fetch
    const s = skillId ? getSkillById(skillId) : null;
    // If not found, still set a minimal object so the UI renders predictably
    setSkill(s || { id: skillId, name: skillId });
    // Mock an owner name if your data doesn't include one yet
    setOwner(s?.ownerName || "Skill owner");
  }, [skillId]);

  // "Send" the request (mock): log to console, show alert, then route back to the skill page
  function handleSubmit(e) {
    e.preventDefault();
    console.log("REQUEST:", { to: owner, skillId, aboutYou });
    alert("Request sent (mock).");
    // After "sending", return to the same skill’s description page
    nav(`/skills/${encodeURIComponent(skillId)}`);
  }

  // Page layout: a simple centered card-style form
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Send Skill Request</h1>

        {/* Simple form with three fields:
            - To:      (pre-filled with the skill owner; editable)
            - Skill:   (read-only pill showing which skill this request is for)
            - About you: (text area for the message body)
        */}
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
            {/* Read-only display so users are sure which skill they’re contacting about */}
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

          {/* Mock submit */}
          <button type="submit" style={styles.button}>Send Request</button>

          {/* Back link returns to the skill detail you came from */}
          <Link to={`/skills/${encodeURIComponent(skillId)}`} style={styles.backLink}>
            ← Back
          </Link>
        </form>
      </div>
    </div>
  );
}

// Inline styles for sprint speed.
// Later we can move to CSS modules or Tailwind for consistency.
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
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: { display: "flex", flexDirection: "column", fontWeight: "600", color: "#333", fontSize: 16 },
  input: { marginTop: 8, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16 },
  skillBox: { marginTop: 8, background: "#f0f0f0", padding: "12px 14px", borderRadius: 8, fontSize: 16 },
  textarea: {
    marginTop: 8, padding: "12px 14px", borderRadius: 8,
    border: "1px solid #ccc", fontSize: 16, resize: "vertical",
  },
  button: {
    background: "#007bff", color: "#fff", padding: "14px", fontSize: 18,
    borderRadius: 8, border: "none", cursor: "pointer", transition: "0.2s",
  },
  backLink: {
    marginTop: 20, textAlign: "center", display: "block",
    color: "#007bff", textDecoration: "none", fontWeight: 500,
  },
};
