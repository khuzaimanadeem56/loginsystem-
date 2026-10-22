import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, default: 'Guest' },
  message: { type: String, required: true },
  from: { type: String, enum: ['user', 'admin'], default: 'user' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', chatSchema);
