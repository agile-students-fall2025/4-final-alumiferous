import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportProblem.css";

const ReportProblem = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!issueType || !description) {
      alert("Please fill out both fields.");
      return;
    }

    setSubmitted(true);
    setIssueType("");
    setDescription("");
    setTimeout(() => {
      setSubmitted(false);
      navigate("/settings");
    }, 1000); 
  };

  return (
    <div className="report-page">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          ←
        </button>
        <h1 className="report-title">Report a Problem</h1>
      </header>

      <div className="report-body">
        <div className="report-content">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="What would you like to report?"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="form-input"
            />

            <textarea
              placeholder="Briefly describe the issue you're encountering..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />

            <button type="submit" className="report-submit">
              Submit
            </button>
          </form>

          {submitted && (
            <div className="report-popup">
              Your report has been submitted. Thank you!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;
