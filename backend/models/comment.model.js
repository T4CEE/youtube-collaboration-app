import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  email: { type: String, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default commentSchema;