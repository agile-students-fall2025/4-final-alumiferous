import mongoose from "mongoose";

const SkillOfferingSchema = new mongoose.Schema({
    skillId: {type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    offeringSlug: {type: String, required: true},
    description: {type: String},
    images: [{type: String}],
    videos: [{type: String}]
}, {timestamps: true});

export default mongoose.model("SkillOffering", SkillOfferingSchema);