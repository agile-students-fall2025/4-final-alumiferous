import React, { useState } from "react";
import "./ReportProblem.css";

const ReportProblem = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!issueType || !description) {
      alert("Please fill out both fields.");
      return;
    }

    setSubmitted(true);
    setIssueType("");
    setDescription("");
    setTimeout(() => setSubmitted(false), 2500); // hides popup after 2.5s
  };

  return (
    <div className="report-container">
      <div className="report-box">
        <h2 className="report-title">Report a Problem</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What would you like to report?"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="report-small-box"
          />

          <textarea
            placeholder="Briefly describe the issue you're encountering..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="report-big-box"
          />

          <button type="submit" className="report-submit">
            Submit
          </button>
        </form>

        {submitted && (
          <div className="report-popup">
            ✅ Your report has been submitted. Thank you!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportProblem;
