import mongoose from "mongoose";

const SkillOfferingSchema = new mongoose.Schema({
    // The offering title provided by the user (e.g. "Python for Finance")
    name: { type: String, required: true, trim: true },
    skillId: {type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    offeringSlug: {type: String, required: true},
    description: {type: String},
    images: [{type: String}],
    videos: [{type: String}],
    categories: [{type: String}]
}, {timestamps: true});

export default mongoose.model("SkillOffering", SkillOfferingSchema);