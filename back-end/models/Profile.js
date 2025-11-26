//models/Profile 
import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  bio: String,
  avatarURL: String,
  firstName: String,
  lastName: String,
});

export default mongoose.model('Profile', profileSchema);
