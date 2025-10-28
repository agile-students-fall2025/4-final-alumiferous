import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { fetchSkillById } from "../api/skills";

export default function DraftRequest() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const skillId = params.get("skillId") || "";
  const [skill, setSkill] = useState(null);
  const [owner, setOwner] = useState("");      // mock owner name/email if you have it
  const [aboutYou, setAboutYou] = useState("");

  // Pull skill details (name) from mock API so UI shows real data
  useEffect(() => {
    let ignore = false;
    if (skillId) {
      fetchSkillById(skillId)
        .then((s) => {
          if (ignore) return;
          setSkill(s);
          // if your mock has s.ownerName or s.ownerEmail, use them:
          setOwner(s.ownerName || "Skill owner");
        })
        .catch(() => setSkill(null));
    }
    return () => { ignore = true; };
  }, [skillId]);

  function handleSubmit(e) {
    e.preventDefault();
    // For now just simulate sending (no backend in this sprint)
    console.log("REQUEST:", { to: owner, skillId, aboutYou });
    alert("Request sent (mock).");
    nav("/requests"); // or wherever your Requests list lives
  }

  return (
    <div style={styles.screen}>
      {/* Logo box */}
      <div style={styles.logo}>InstaSkill</div>

      <h1 style={styles.title}>Send Skill Request</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.block}>
          <div style={styles.label}>To:</div>
          <input
            style={styles.input}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder={`To: ${skill?.name || "Skill"} owner`}
          />
        </label>

        <div style={{ height: 16 }} />

        <div style={styles.label}>Interested in skill:</div>
        <div style={styles.skillPill}>{skill?.name || "(unknown skill)"}</div>

        <div style={{ height: 16 }} />

        <label style={styles.block}>
          <div style={styles.label}>Say something about yourself</div>
          <textarea
            style={styles.textarea}
            rows={7}
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
            placeholder="Briefly introduce yourself and what you need…"
            required
          />
        </label>

        <button type="submit" style={styles.cta}>Send Request</button>

        <div style={{ marginTop: 12 }}>
          <Link to="/" style={{ textDecoration: "none" }}>← Back</Link>
        </div>
      </form>

      {/* Bottom bar (optional – add only if your app uses it globally) */}
      <div style={styles.tabbar}>
        <Tab to="/">Home</Tab>
        <Tab to="/profile">Profile</Tab>
        <Tab to="/upload">Upload</Tab>
        <Tab to="/chat">Chat</Tab>
        <Tab to="/requests">Requests</Tab>
      </div>
    </div>
  );
}

function Tab({ to, children }) {
  return (
    <Link to={to} style={styles.tab}>{children}</Link>
  );
}

const styles = {
  screen: {
    minHeight: "100dvh",
    padding: "16px 16px 90px",
    boxSizing: "border-box",
  },
  logo: {
    width: 120, height: 80, border: "2px solid #999",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#eee", borderRadius: 4, fontWeight: 600,
  },
  title: { fontSize: 28, margin: "12px 0 16px" },
  form: { maxWidth: 560 },
  block: { display: "block" },
  label: { fontWeight: 600, marginBottom: 8 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 6,
    border: "1px solid #ccc", fontSize: 16,
  },
  skillPill: {
    display: "inline-block", background: "#ddd", padding: "14px 24px",
    borderRadius: 6, fontSize: 20, fontWeight: 600,
  },
  textarea: {
    width: "100%", padding: "12px 14px", borderRadius: 6,
    border: "1px solid #ccc", fontSize: 16, resize: "vertical",
  },
  cta: {
    marginTop: 24, width: "100%", background: "#000", color: "#fff",
    border: "none", padding: "16px", borderRadius: 8, fontSize: 18, cursor: "pointer",
  },
  tabbar: {
    position: "fixed", left: 0, right: 0, bottom: 0, height: 64,
    background: "#e9e9e9", borderTop: "1px solid #ccc",
    display: "flex", justifyContent: "space-around", alignItems: "center",
  },
  tab: {
    background: "#666", color: "#fff", padding: "8px 12px",
    borderRadius: 6, textDecoration: "none", fontSize: 14,
  },
};
