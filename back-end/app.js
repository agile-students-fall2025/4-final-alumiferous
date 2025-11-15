// Import and instantiate Express
import express from 'express'; // ES module import style
import dotenv from 'dotenv'; // Load environmental variables from .env
import morgan from 'morgan'; // Middleware for logging HTTP requests
import authRoutes from './routes/auth.js';
import messagesRoutes from './routes/messages.js';
import chatsRoutes from './routes/chats.js';

// Load environment variables from .env file
dotenv.config();

// Create an Express app instance
const app = express();

// Log all incoming HTTP requests in dev format
app.use(morgan('dev'));

// Decode JSON-formatted POST data
app.use(express.json());

// Decode URL-encoded POST data (e.g., from forms)
app.use(express.urlencoded({ extended: true }));

// Make 'public' directory readable with /static route for static content
app.use('/static', express.static('public'));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/chats', chatsRoutes);

// Example root route: responds with a confirmation message
app.get('/', (req, res) => {
  res.send('Express backend for Alumiferous is running!');
});

// Export the Express app for use by server.js and test code
export default app;
