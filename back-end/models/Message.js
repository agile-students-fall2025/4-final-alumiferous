import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who have read this message
});

export default mongoose.model('Message', messageSchema)