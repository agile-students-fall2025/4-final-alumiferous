import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

// GET all users from Mockaroo
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://my.api.mockaroo.com/users.json?key=${process.env.API_SECRET_KEY}`
    );
    console.log('Mockaroo response:', response.data);
    const users = Array.isArray(response.data) ? response.data : [response.data];
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users from Mockaroo:", err);
    res.status(500).json({ error: "Failed to fetch users from Mockaroo." });
  }
});

// GET user profile by id from Mockaroo
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://my.api.mockaroo.com/users.json?key=${process.env.API_SECRET_KEY}`
    );
    console.log('Mockaroo response:', response.data);
    const users = Array.isArray(response.data) ? response.data : [response.data];
    const user = users.find(u => u.id === Number(req.params.id));
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

