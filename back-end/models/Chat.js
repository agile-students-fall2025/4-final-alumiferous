import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    online: { type: Boolean, default: false },

});

export default mongoose.model('Chats',chatSchema)