// back-end/routes/skills.js
import express from "express";

const router = express.Router();

// In-memory "database" for now.
// Later you can replace this with your Mockaroo data or real DB.
const skills = [];

/**
 * POST /api/skills
 * Creates a new skill that matches the Mockaroo schema:
 * skillId, name, brief, detail, image, userId, username, category
 */
router.post("/", (req, res) => {
  const { name, category, brief, detail, image, userId, username } = req.body;

  // must at least have name + category
  if (!name || !category) {
    return res
      .status(400)
      .json({ error: "name and category are required" });
  }

  // Auto-generate a new skillId 
  const newSkillId = skills.length ? skills[skills.length - 1].skillId + 1 : 1;

  const finalDetail = detail || brief || "";
  const finalBrief =
    brief ||
    (finalDetail.length > 120
      ? finalDetail.slice(0, 117) + "..."
      : finalDetail);

  const newSkill = {
    skillId: newSkillId,
    name,
    brief: finalBrief,
    detail: finalDetail,
    image:
      image ||
      `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`,
    userId: userId ?? 1, 
    username: username || "demoUser",
    category,
  };

  skills.push(newSkill);

  return res.status(201).json(newSkill);
});

export default router;
