import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  email: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default commentSchema;