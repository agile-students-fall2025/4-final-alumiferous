// Import and instantiate Express
import express from 'express'; // ES module import style
import dotenv from 'dotenv'; // Load environmental variables from .env
import morgan from 'morgan'; // Middleware for logging HTTP requests
import cors from 'cors' // middleware for enabling CORS (Cross-Origin Resource Sharing) requests.
       

// models
import "./models/Skill.js";

// routes
import skillsRoutes from "./routes/skills.js";
import profileRoutes from "./routes/profile.js";
import authRoutes from "./routes/auth.js";
import chatsRoutes from './routes/chats.js';
import messagesRoutes from './routes/messages.js';
import onboardingRoutes from './routes/onboarding.js';



// Load environment variables from .env file
dotenv.config();

// Create an Express app instance
const app = express();

// Enable CORS for frontend on localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000", "http://10.188.201.185:3000"], // your React dev server
  
  })
);

// Log all incoming HTTP requests in dev format
app.use(morgan("dev"));

// app.use(cors()) // allow cross-origin resource sharing
// Decode JSON-formatted POST data
app.use(express.json());

// Decode URL-encoded POST data (e.g., from forms)
app.use(express.urlencoded({ extended: true }));


// Make 'public' directory readable with /static route for static content
app.use('/static', express.static('public'));

// Example root route: responds with a confirmation message
app.get("/", (req, res) => {
  res.send("Express backend for Alumiferous is running!");
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use("/api/skills", skillsRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/onboarding', onboardingRoutes);
// Profile API
app.use("/api/profile", profileRoutes);          



// Export the Express app for use by server.js and test code
export default app;
