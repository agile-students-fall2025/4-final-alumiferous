import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    isMe: { type: Boolean, default: false },
    sentAt: { type: Date },
   
});

export default mongoose.model('Message', messageSchema)