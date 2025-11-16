// back-end/routes/skills.js
import express from "express";

import axios from "axios";

const router = express.Router();

// In-memory "database" for now.
// Later you can replace this with your Mockaroo data or real DB.
let skills = [];

// back-up data incase fetching fails
const backupSkills = [
      {
        skillId: 1,
        name: "Public Speaking",
        brief: "Confident presentations and speeches.",
        detail:
          "Deliver powerful speeches and communicate ideas effectively through audience-centered presentations and storytelling.",
        image: `${process.env.PUBLIC_URL}/images/public-speaking.jpg`,
        userId: 1,
        username: "jsmith",
        category: "Public Relations",
      },
      {
        skillId: 2,
        name: "Python",
        brief: "Programming and data analysis using Python.",
        detail:
          "Learn to write efficient scripts, analyze data, and build software using Python's extensive libraries.",
        image: `${process.env.PUBLIC_URL}/images/python.jpeg`,
        userId: 2,
        username: "amorgan",
        category: "Technology",
      },
      {
        skillId: 3,
        name: "Graphic Design",
        brief: "Creating visuals with Adobe Illustrator.",
        detail:
          "Explore typography, layout, and color to produce creative designs using modern digital tools.",
        image: `${process.env.PUBLIC_URL}/images/graphic-design.jpeg`,
        userId: 3,
        username: "tnguyen",
        category: "Arts",
      },
      {
        skillId: 4,
        name: "Video Editing",
        brief: "Editing videos in Premiere Pro and Final Cut.",
        detail:
          "Master cutting, color grading, and transitions to create professional-level video projects.",
        image: `${process.env.PUBLIC_URL}/images/video-editing.jpeg`,
        userId: 4,
        username: "rpatel",
        category: "Technology",
      },
      {
        skillId: 5,
        name: "Spanish",
        brief: "Conversational and written fluency.",
        detail:
          "Improve your Spanish speaking and comprehension for travel, business, or cultural enrichment.",
        image: `${process.env.PUBLIC_URL}/images/spanish.jpg`,
        userId: 5,
        username: "mgomez",
        category: "Arts",
      },
      {
        skillId: 6,
        name: "Photography",
        brief: "Portrait and landscape photography.",
        detail:
          "Learn to capture stunning photos using natural light, composition, and post-processing techniques.",
        image: `${process.env.PUBLIC_URL}/images/photography.jpg`,
        userId: 6,
        username: "lcooper",
        category: "Sports",
      },
      {
        skillId: 7,
        name: "Web Development",
        brief: "Building with HTML, CSS, JavaScript.",
        detail:
          "Design and code responsive websites using front-end technologies and frameworks.",
        image: `${process.env.PUBLIC_URL}/images/web-development.jpg`,
        userId: 7,
        username: "dchung",
        category: "Technology",
      },
    ];

//Helper to attach computed fieilds, saved and hidden options
function addComputedFields(skill){
  return{
    ...skill,
    width: Math.floor(Math.random() * 80) + 150,
    height: Math.floor(Math.random() * 100) + 200,
    saved: false,
    hidden: false,
  };
}

/**
 * GET /api/skills
 * Fetches skills from Mockaroo once, stores it in memory for caching
 */
router.get('/', async(req, res) => {
  try{
    if (skills.length > 0) { //there is data in cached skills
      return res.json(skills);
    }

    const apiKey = process.env.API_SECRET_KEY;
    if (!apiKey) {
      console.error("Missing API_SECRET_KEY env variable");
      skills = backupSkills.map(addComputedFields);
      return res.json(skills);
    }

    console.log("Fetchinh skills from Mockaroo...");

    const response = await axios.get(
      `https://my.api.mockaroo.com/skills.json?key=${apiKey}`
    );

    skills = response.data.map(addComputedFields); 
    return res.json(skills);

  } catch (error){
    console.error("Mockaroo API failed:", error.message);

    skills = backupSkills.map(addComputedFields);
    return res.json(skills);
  }
});

/**
 * POST /api/skills
 * Creates a new skill that matches the Mockaroo schema:
 * skillId, name, brief, detail, image, userId, username, category
 */
router.post("/", (req, res) => {
  const { name, category, brief, detail, description, image, userId, username } = req.body;

  // must at least have name + category
  if (!name || !category) {
    return res
      .status(400)
      .json({ error: "name and category are required" });
  }

  // Auto-generate a new skillId 
  const newSkillId = skills.length ? skills[skills.length - 1].skillId + 1 : 1;

  const finalDetail = detail || description || brief || "";
  const finalBrief =
    brief ||
    (finalDetail.length > 120
      ? finalDetail.slice(0, 117) + "..."
      : finalDetail);

  const newSkill = {
    skillId: newSkillId,
    id: newSkillId,
    name,
    brief: finalBrief,
    detail: finalDetail,
    description: finalDetail,
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
