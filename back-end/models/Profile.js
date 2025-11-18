//Profile Schema
import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  bio: String,
  avatarUrl: String,
  skillsOffered: [String],
  skillsWanted: [String],
});

export default mongoose.model('Profile', profileSchema);
