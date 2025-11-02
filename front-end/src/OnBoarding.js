import React, { useState } from "react";
import "./OnBoarding.css";
import SkillSelector from "./SkillsSelector";
import { skills } from "./skills";
import { useNavigate } from "react-router-dom";

const OnBoarding = () => {
  //state variables for each step of the onboarding process
  const [step, setStep] = useState(1);
  //state variable to store data collected

  //variable for navigations
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    skillsOffered: [],
    skillsWanted: [],
    motivation: [],
    appUsage: "",
    weeklyCommitment: "",
  });
  //handle even change onclick e is the entity that changes
  const handleChange = e => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    })
  };
  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Submitting data:", formData)
    navigate("/home")
  };

  //validation checks for all fields completed
  const validateStep = () => {
  switch (step) {
    case 1:
      return formData.username.trim() !== "";

    case 2:
      return formData.skillsOffered.length > 0;

    case 3:
      return formData.skillsWanted.length > 0;

    case 4:
      return formData.preferredLanguage !== "";

    case 5:
      return formData.weeklyCommitment !== "";

    default:
      return true;
  }
};


  //updates for step state variable
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  //custom array of skill use can choose from
  const allSkills = [
    "Python",
    "Public Speaking",
    "Cooking",
    "Graphic Design",
    "3D Modeling",
    "Photography",
    "Web Development",
    "Marketing",
    "Music Production",
    "UI Design",
  ];

  return (
    <div className="onboarding-container">
      <form onSubmit={handleSubmit} className="onboarding-form">
        {step === 1 && (
          <div className="onboarding-step">
            <h1>Welcome to InstaSkill</h1>
            <h2>Let's get to know you!</h2>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />
            <button type="button" onClick={() => {
                if (validateStep()) {
                    nextStep();
                }else {
                    alert("Please fill the required fileds before you proceed")
                }
            }}>
              Next
            </button>
          </div>
        )}

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
            <button type="button" onClick={prevStep}>
              Back
            </button>
            <button type="button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}

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
            <button type="button" onClick={prevStep}>
              Back
            </button>
            <button type="button" onClick={() => {
                if (validateStep()) {
                    nextStep();
                }else {
                    alert("Please fill the required fileds before you proceed")
                }
            }}>
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step">
            <h1>What best describes how you plan to use InstaSkill?</h1>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              
            >
              <option value="">Select...</option>
              <option value="Student">To learn new skills or improve my abilities</option>
              <option value="Instructor">To share my expertise and teach others</option>
              <option value="Networking">To connect and collaborate with other professionals</option>
              <option value="Business">To promote or grow my business through skill exchange</option>
            </select>
            <button type="button" onClick={prevStep}>
              Back
            </button>
            <button type="button" onClick={() => {
                if (validateStep()) {
                    nextStep();
                }else {
                    alert("Please fill the required filed before you proceed")
                }
            }}>
              Next
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step">
            <h1>How much time can you commit weekly?</h1>
            <select
              name="weeklyCommitment"
              value={formData.weeklyCommitment}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="1-2 hrs">1–2 hrs</option>
              <option value="3-5 hrs">3–5 hrs</option>
              <option value="6+ hrs">6+ hrs</option>
            </select>
            <button type="button" onClick={prevStep}>
              Back
            </button>
            <button type="submit" onClick={(e) => {
                if (validateStep()) {
                    handleSubmit(e);
                }else {
                    alert("Please fill the required filed before you proceed")
                }
            }}>Finish</button>
          </div>
        )}
      </form>
    </div>
  );
};
export default OnBoarding;
