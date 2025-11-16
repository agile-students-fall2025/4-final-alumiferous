import React, { useState, useContext, useMemo } from "react";
import "./OnBoarding.css";
import SkillSelector from "./SkillsSelector";
import { useNavigate } from "react-router-dom";
import { SkillsContext } from "./SkillsContext";
import axios from "axios";

const OnBoarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { skills } = useContext(SkillsContext);

  const [formData, setFormData] = useState({
    username: "",
    skillsOffered: [],
    skillsWanted: [],
    motivation: [],
    appUsage: "",
    weeklyCommitment: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  // FORM INPUT HANDLER
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // VALIDATION LOGIC
  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.username.trim() !== "";

      case 2:
        return formData.skillsOffered.length > 0;

      case 3:
        return formData.skillsWanted.length > 0;

      case 4:
        return formData.appUsage !== "";

      case 5:
        return formData.weeklyCommitment !== "";

      default:
        return true;
    }
  };

  // SUBMIT HANDLER (connect to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending onboarding data:", formData);

      await axios.post("http://localhost:5000/api/onboarding", formData);

      console.log("Onboarding data sent successfully!");
      navigate("/home");
    } catch (err) {
      console.error("Error submitting onboarding:", err);
      setErrorMsg("Failed to complete onboarding. Please try again.");
    }
  };

  // STEP NAVIGATION
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Unique skills list
  const allSkills = useMemo(() => {
    const unique = [...new Set(skills.map((s) => s.name))];
    return unique.sort();
  }, [skills]);

  return (
    <div className="onboarding-container">
      <form onSubmit={handleSubmit} className="onboarding-form">

        {errorMsg && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>{errorMsg}</p>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="onboarding-step">
            <h1>Welcome to InstaSkill</h1>
            <h2>Let's get to know you!</h2>

            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() =>
                validateStep() ? nextStep() : alert("Please enter a username.")
              }
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="onboarding-step">
            <h1>What skills can you offer?</h1>

            <SkillSelector
              label="Select the skill you can offer"
              allSkills={allSkills}
              selectedskills={formData.skillsOffered}
              setSelectedSkills={(skills) =>
                setFormData({ ...formData, skillsOffered: skills })
              }
            />

            <button type="button" onClick={prevStep}>Back</button>
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="onboarding-step">
            <h1>What do you want to learn?</h1>

            <SkillSelector
              label="Select the skill you want to learn"
              allSkills={allSkills}
              selectedskills={formData.skillsWanted}
              setSelectedSkills={(skills) =>
                setFormData({ ...formData, skillsWanted: skills })
              }
            />

            <button type="button" onClick={prevStep}>Back</button>
            <button
              type="button"
              onClick={() =>
                validateStep() ? nextStep() : alert("Please select a skill.")
              }
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="onboarding-step">
            <h1>How will you use InstaSkill?</h1>

            <select
              name="appUsage"
              className="form-input"
              value={formData.appUsage}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Learning">Learn new skills</option>
              <option value="Teaching">Share my expertise</option>
              <option value="Networking">Connect with people</option>
              <option value="Business">Grow my business</option>
            </select>

            <button type="button" onClick={prevStep}>Back</button>

            <button
              type="button"
              onClick={() =>
                validateStep() ? nextStep() : alert("Select how you’ll use the app.")
              }
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 5 (FINAL) */}
        {step === 5 && (
          <div className="onboarding-step">
            <h1>How much time can you commit weekly?</h1>

            <select
              name="weeklyCommitment"
              className="form-input"
              value={formData.weeklyCommitment}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="1-2 hrs">1–2 hrs</option>
              <option value="3-5 hrs">3–5 hrs</option>
              <option value="6+ hrs">6+ hrs</option>
            </select>

            <button type="button" onClick={prevStep}>Back</button>

            <button
              type="submit"
              onClick={(e) => {
                if (!validateStep()) {
                  alert("Please choose your weekly commitment.");
                  e.preventDefault();
                  return;
                }
              }}
            >
              Finish
            </button>
          </div>
        )}

      </form>
    </div>
  );
};

export default OnBoarding;
