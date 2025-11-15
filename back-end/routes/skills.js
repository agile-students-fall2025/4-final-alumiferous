import express from "express";
import Skill from "../models/Skill.js";

const router = express.Router();

// POST /api/skills
router.post("/", async (req, res) => {
  try {
    const { category, name, description, videoUrl } = req.body;

    // basic validation
    if (!category || !name || !description) {
      return res.status(400).json({ error: "category, name, and description are required" });
    }

    const newSkill = new Skill({
      category,
      name,
      description,
      videoUrl: videoUrl || null,
    });

    const savedSkill = await newSkill.save();

    // return the new record
    return res.status(201).json(savedSkill);
  } catch (err) {
    console.error("Error creating skill:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
