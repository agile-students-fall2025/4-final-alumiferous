import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    unread: { type: Number, default: 0 },
    online: { type: Boolean, default: false },
    lastMessage: { type: String }
});

export default mongoose.model('Chats',chatSchema)