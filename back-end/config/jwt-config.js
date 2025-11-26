const mongoose = require('mongoose');
const User = require('../models/User.js');
const passportJWT = require('passport-jwt');
const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

// JWT options
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), // Get token from Authorization header
  secretOrKey: process.env.JWT_SECRET, // Secret from .env
};

// Debug: ensure secret is loaded
console.log('JWT options:', jwtOptions);

// Verify JWT payload
const jwtVerifyToken = async (jwt_payload, next) => {
  // Check expiration
  if (new Date(jwt_payload.exp * 1000) < new Date()) {
    return next(null, false, { message: 'JWT token has expired.' });
  }
  // Find user by ID
  try {
    const user = await User.findById(jwt_payload.id).exec();
    if (user) return next(null, user);
    return next(null, false, { message: 'User not found' });
  } catch (err) {
    return next(err, false);
  }
};

// Export JWT strategy for passport
module.exports = new JwtStrategy(jwtOptions, jwtVerifyToken);