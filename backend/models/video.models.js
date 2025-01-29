import mongoose from 'mongoose';
import commentSchema from './comment.model.js'

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  email: { type: String, required: true },
  isPlaylist: { type: Boolean, default: false },
  collaborators: [{ type: String }],
  comments: [commentSchema],
});

const Video = mongoose.model('Video', videoSchema);
export default Video;