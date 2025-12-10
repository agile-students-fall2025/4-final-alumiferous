import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

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
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#121212] box-border overflow-hidden">
      <header className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate("/settings")}>
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 text-center">Report a Problem</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 overflow-y-auto pt-[144px] pb-[calc(200px+env(safe-area-inset-bottom))] px-5 py-4">
        <div className="w-full max-w-[600px] mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="What would you like to report?"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="form-input dark:!text-white dark:!bg-[#2b2b2b] dark:placeholder-gray-400"
            />

            <textarea
              placeholder="Briefly describe the issue you're encountering..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input min-h-[120px] resize-y dark:!text-white dark:!bg-[#2b2b2b] dark:placeholder-gray-400"
            />

            <button type="submit" className="btn btn-primary w-full">
              Submit
            </button>
          </form>

          {submitted && (
            <div className="mt-4 p-4 bg-[#d4edda] dark:bg-[#155724] text-[#155724] dark:text-[#d4edda] rounded-lg text-center font-medium">
              Your report has been submitted. Thank you!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;
