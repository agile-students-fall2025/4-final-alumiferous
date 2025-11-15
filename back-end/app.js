// Import and instantiate Express
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";          

// models
import "./models/Skill.js";

// routes
import skillsRoutes from "./routes/skills.js";

// Load environment variables from .env file
dotenv.config();

// Create an Express app instance
const app = express();

// Enable CORS for frontend on localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000", // your React dev server
  })
);

// Log all incoming HTTP requests in dev format
app.use(morgan("dev"));

// Decode JSON-formatted POST data
app.use(express.json());

// Decode URL-encoded POST data (e.g., from forms)
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Make 'public' directory readable with /static route for static content
app.use('/static', express.static('public'));

// Mount API routes
app.use('/api/auth', authRoutes);

// Example root route: responds with a confirmation message
app.get("/", (req, res) => {
  res.send("Express backend for Alumiferous is running!");
});

// Skills API
app.use("/api/skills", skillsRoutes);

// Export the Express app for use by server.js and test code
export default app;
