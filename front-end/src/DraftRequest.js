import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getSkillById } from "./skills";
import "./DraftRequest.css";

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
    <div className="page">
      <div className="container">
        <h1 className="title">Send Skill Request</h1>

        {/* Simple form with three fields:
            - To:      (pre-filled with the skill owner; editable)
            - Skill:   (read-only pill showing which skill this request is for)
            - About you: (text area for the message body)
        */}
  <form onSubmit={handleSubmit} className="form">
          <label className="label">
            To:
            <input
              className="input"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder={`To: ${skill?.name || "Skill"} owner`}
            />
          </label>

          <label className="label">
            Interested in skill:
            {/* Read-only display so users are sure which skill they’re contacting about */}
            <div className="skillBox">{skill?.name || "(unknown skill)"}</div>
          </label>

          <label className="label">
            Say something about yourself:
            <textarea
              className="textarea"
              rows={6}
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
              placeholder="Briefly introduce yourself and what you need…"
              required
            />
          </label>

          {/* Mock submit */}
          <button type="submit" className="button">Send Request</button>

          {/* Back link returns to the skill detail you came from */}
          <Link to={`/skills/${encodeURIComponent(skillId)}`} className="backLink">
            ← Back
          </Link>
        </form>
      </div>
    </div>
  );
}

