import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "SkillOffering", required: true },
    skillName: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requesterName: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "declined"], 
        default: "pending" 
    }
}, { timestamps: true });

export default mongoose.model("Request", RequestSchema);
