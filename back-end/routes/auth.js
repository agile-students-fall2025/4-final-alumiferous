// Authentication routes for login and signup
import express from 'express';
const router = express.Router();

/**
 * POST /api/auth/login
 * Expects: { email, password }
 * Returns: { success, username, token, message }
 */
router.post('/login', async (req, res) => {
  console.log('LOGIN REQUEST received:', {
    email: req.body.email,
  });

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('LOGIN FAILED: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // TODO: Replace with actual database lookup

    // Mock user lookup (replace with DB query)
    const mockUser = {
      id: 1,
      email: email,
      username: email.split('@')[0],
      firstName: 'Demo',
      lastName: 'User',
    };

    // Mock password check (replace with bcrypt.compare)
    const isPasswordValid = password.length >= 6; // Simple validation for demo

    if (!isPasswordValid) {
      console.log('LOGIN FAILED: Invalid password for', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Successful login
    console.log('LOGIN SUCCESS:', email);
    res.json({
      success: true,
      username: mockUser.username,
      userId: mockUser.id,
      token: 'mock-jwt-token-' + Date.now(), // will have to replace with actual JWT
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message,
    });
  }
});




/*
 * POST /api/auth/signup
 * Expects: { email, password, firstName, lastName }
 * Returns: { success, username, userId, token, message }
 */
router.post('/signup', async (req, res) => {
  console.log('SIGNUP REQUEST received:', {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      console.log('SIGNUP FAILED: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('SIGNUP FAILED: Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('SIGNUP FAILED: Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // TODO: Replace with actual database operations
    // Mock user creation (have to replace with DB insert)
    const newUser = {
      id: Date.now(), // Mock ID
      email: email,
      username: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      createdAt: new Date().toISOString(),
    };

    // Successful signup
    console.log('SIGNUP SUCCESS:', email, 'User ID:', newUser.id);
    res.status(201).json({
      success: true,
      username: newUser.username,
      userId: newUser.id,
      token: 'mock-jwt-token-' + Date.now(), // Replace with actual JWT
      message: 'Account created successfully',
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: err.message,
    });
  }
});




/*
 * Route for user logout
 * POST /api/auth/logout
 * Returns: { success, message }
 */
router.post('/logout', (req, res) => {
  try {
    // TODO: In production with JWT:
    // 1. Invalidate token (add to blacklist)
    // 2. Clear any server-side sessions

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: err.message,
    });
  }
});

// Export the router
export default router;
