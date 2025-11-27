import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true, unique: true},
  slug: {type: String, required: true, unique: true},
  categories: [{type: String}]
}, {timestamps: true});

export default mongoose.model("Skill", SkillSchema);
