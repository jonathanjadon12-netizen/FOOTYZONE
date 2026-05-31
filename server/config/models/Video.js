const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title for the video."],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Video", VideoSchema);
