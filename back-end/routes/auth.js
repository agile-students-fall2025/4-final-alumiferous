// Authentication routes using ES modules
import express from 'express';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../config/email.js';


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

// Forgot Password: POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  
  try {
    const user = await User.findOne({ email }).exec();
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Error processing request.', error: err.message });
  }
});

// Reset Password: POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }
  
  try {
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).exec();
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password reset token is invalid or has expired.' 
      });
    }
    
    // Update the password (will be hashed by the pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
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

// Change Password (for logged-in users): POST /auth/change-password
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'User ID, current password, and new password are required.' });
  }
  
  try {
    const user = await User.findById(userId).exec();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Verify current password
    if (!user.validPassword(currentPassword)) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    
    // Update to new password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully.' 
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Error changing password.', error: err.message });
  }
});

// Delete Account (hard delete): DELETE /auth/delete-account
router.delete('/delete-account', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }
  
  try {
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    }).exec();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Verify password
    if (!user.validPassword(password)) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }
    
    const userId = user._id;
    console.log(`Deleting account for user: ${user.username || user.email} (ID: ${userId})`);
    
    // Import models needed for cascade deletion
    const SkillOffering = (await import('../models/SkillOffering.js')).default;
    const Request = (await import('../models/Request.js')).default;
    const Chat = (await import('../models/Chat.js')).default;
    const Message = (await import('../models/Message.js')).default;
    
    // Delete all user's skill offerings
    const deletedSkills = await SkillOffering.deleteMany({ userId }).exec();
    console.log(`Deleted ${deletedSkills.deletedCount} skill offerings`);
    
    // Delete all requests sent by or to this user
    const deletedRequests = await Request.deleteMany({ 
      $or: [{ requesterId: userId }, { ownerId: userId }] 
    }).exec();
    console.log(`Deleted ${deletedRequests.deletedCount} requests`);
    
    // Delete all chats involving this user
    const deletedChats = await Chat.deleteMany({ 
      participants: userId 
    }).exec();
    console.log(`Deleted ${deletedChats.deletedCount} chats`);
    
    // Delete all messages sent by this user
    const deletedMessages = await Message.deleteMany({ senderId: userId }).exec();
    console.log(`Deleted ${deletedMessages.deletedCount} messages`);
    
    // Finally, delete the user account
    await User.findByIdAndDelete(userId).exec();
    console.log(`User account deleted successfully`);
    
    res.json({ 
      success: true, 
      message: 'Account and all associated data deleted successfully.' 
    });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, message: 'Error deleting account.', error: err.message });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error');
});


export default router;
