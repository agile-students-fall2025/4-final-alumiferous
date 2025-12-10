// Authentication routes using ES modules
import express from 'express';
import User from '../models/User.js';


const router = express.Router();

// Signup: POST /auth/signup
router.post('/signup', async (req, res) => {
  console.log('Signup route hit');
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(401).json({ success: false, message: 'No email or password supplied.' });
  }
  try {
    const user = await new User({ email, password, firstName, lastName }).save();
    console.log(`New user: ${user.email}, userId: ${user._id}`);
    const token = user.generateJWT();
    // Build username from available data
    const username = user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
    res.json({
      success: true,
      message: 'User saved successfully.',
      token,
      userId: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: username,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: username
      }
    });
  } catch (err) {
    // Handle duplicate email error 
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please use a different email.'
      });
    }
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Error saving user to database.', error: err });
  }
});

// Login: POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ success: false, message: 'No email or password supplied.' });
  }
  try {
      const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found for this email. Please sign up first.' });
    }
    if (!user.validPassword(password)) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }
      // ...existing code...
      const token = user.generateJWT();
      // Build username from available data
      const username = user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
      res.json({
        success: true,
        message: 'User logged in successfully.',
        token,
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: username,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: username
        }
      });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error looking up user in database.', error: err });
  }
});

// Logout: GET /auth/logout
router.get('/logout', (req, res) => {
  // With JWT, logout is handled on the frontend by deleting the token
  res.json({ success: true, message: 'Delete your token from local storage to logout.' });
});

// Reset Password: POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }
  
  try {
    const user = await User.findOne({ email }).exec();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }
    
    // Update the password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Error resetting password.', error: err.message });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error');
});


export default router;
