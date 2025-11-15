import express from "express";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// GET user profile by id from Mockaroo
router.get("/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://my.api.mockaroo.com/users.json?key=${process.env.API_SECRET_KEY}`
    );
    const users = await response.json();
    const user = users.find(u => u.userId === Number(req.params.id));
    if (user) return res.json(user);
    res.status(404).json({ error: "User not found" });
  } 
  catch (err) {
    console.error("Error fetching from Mockaroo:", err);
    res.status(500).json({ error: "Failed to fetch from Mockaroo." });
}
});

// PUT update profile by id (can still just echo for now)
router.put("/:id", (req, res) => {
  res.json({ success: true, user: req.body });
});

export default router;