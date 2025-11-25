import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true }, // use 'name' instead of 'title'
  description: String,
  category: String,
  videoUrl: String,
  imageUrl: String, 
});

const Skill = mongoose.model("Skill", SkillSchema);
export default Skill;
