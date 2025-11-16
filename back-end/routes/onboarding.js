import express from "express";
const router = express.Router();

// Temporary in-memory user store
let users = [];

/**
 * POST /api/users/onboarding
 * Saves onboarding data for a new user
 */
router.post("/", (req, res) => {
  const {
    username,
    skillsAcquired,
    skillsWanted,
    motivations,
    appUsage,
    weeklyCommitment
  } = req.body;

  const newUser = {
    userId: users.length + 1,
    username,
    profilePhoto: null,
    about: "",
    skillsAcquired: skillsAcquired || [],
    skillsWanted: skillsWanted || [],
    motivations: motivations || [],
    appUsage: appUsage || "",
    weeklyCommitment: weeklyCommitment || 0
  };

  // TEMP: store in memory during Sprint 2
  users.push(newUser);

  console.log("New onboarding data received:", newUser);

  return res.status(201).json({
    message: "Onboarding saved (mock DB)",
    user: newUser
  });
});

export default router;

