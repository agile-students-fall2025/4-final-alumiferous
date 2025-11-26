import mongoose, { STATES } from "mongoose";
import Skill from "./Skill";

const SkillOfferingSchema = new mongoose.Schema({
    skillId: {type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true},
    userId: {typeof: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    offeringSlug: {type: String, required: true},
    description: [String],
    images: [String],
    videos: [String]
}, {timestamps: true});

export default mongoose.model("SkillOffering", SkillOfferingSchema);