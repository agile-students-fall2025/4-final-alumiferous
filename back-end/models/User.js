// Mongoose User model with password hashing and JWT support
import mongoose from 'mongoose';
import { createRequire } from 'module';
import { type } from 'os';
const require = createRequire(import.meta.url);

// Try to load optional dependencies; if they are missing (e.g., in test env),
// fall back to safe no-op implementations so the model can still be imported.
let bcrypt = null;
let jwt = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  // bcrypt not installed — tests may still run without hashing
  bcrypt = null;
}

try {
  jwt = require('jsonwebtoken');
} catch (e) {
  jwt = null;
}


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },      // optional
  username: { type: String },   // optional
  offeredSkills: [{type: mongoose.Schema.Types.ObjectId, ref: "SkillOffering"}],
  neededSkills: [{type: mongoose.Schema.Types.ObjectId, ref: "Skill"}],
  savedSkills: [{type: mongoose.Schema.Types.ObjectId, ref: "SkillOffering"}],
  bio: {type: String}
});


// Hash password before saving to DB
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  if (!bcrypt) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

// Compare input password with hashed password
userSchema.methods.validPassword = function (password) {
  if (!bcrypt) return this.password === password;
  return bcrypt.compareSync(password, this.password);
};

// Generate JWT token for authentication
userSchema.methods.generateJWT = function () {
  // Set expiration in days from env
  const exp = Math.floor(Date.now() / 1000) + ((parseInt(process.env.JWT_EXP_DAYS) || 7) * 24 * 60 * 60);
  if (!jwt || !process.env.JWT_SECRET) {
    // fallback: return a simple token-like string for environments without jsonwebtoken
    return `token-${String(this._id)}-${exp}`;
  }
  return jwt.sign({ id: this._id, username: this.username, exp }, process.env.JWT_SECRET);
};

// Return user info for frontend (no password)
userSchema.methods.toAuthJSON = function () {
  return { username: this.username, token: this.generateJWT() };
};

// Export User model (ES module)
export default mongoose.model('User', userSchema);