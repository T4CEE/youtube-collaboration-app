import mongoose from 'mongoose';
import commentSchema from './comment.model.js';

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  email: { type: String, ref: 'User', required: true },
  collaborators: [{ type: String, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Video = mongoose.model('Video', videoSchema);
export default Video;