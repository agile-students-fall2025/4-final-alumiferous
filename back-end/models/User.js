// Mongoose User model with password hashing and JWT support
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },      // optional
  username: { type: String }    // optional
});


// Hash password before saving to DB
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

// Compare input password with hashed password
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Generate JWT token for authentication
userSchema.methods.generateJWT = function () {
  // Set expiration in days from env
  const exp = Math.floor(Date.now() / 1000) + (parseInt(process.env.JWT_EXP_DAYS) * 24 * 60 * 60);
  return jwt.sign(
    { id: this._id, username: this.username, exp },
    process.env.JWT_SECRET
  );
};

// Return user info for frontend (no password)
userSchema.methods.toAuthJSON = function () {
  return { username: this.username, token: this.generateJWT() };
};

// Export User model (ES module)
export default mongoose.model('User', userSchema);