// Import the express app from app.js (ES module import style)
import app from './app.js';

// load environment variables from .env file
require('dotenv').config({silent: true})

// Use environment variable PORT or default to 4000
const port = process.env.PORT || 4000;


// Start listening for incoming HTTP(S) requests on the specified port
const listener = app.listen(port, function () {
  console.log(`Server running on port: ${port}`);
});

// Function to stop the server (useful for automated testing)
// This allows other modules to programmatically shut down the server if needed
const close = () => {
  listener.close();
};

// Export the close function so tests and other tools can access it
export { close };