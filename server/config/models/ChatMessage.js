const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Null for guest users
    },
    guestId: {
      type: String,
      required: false, // Used for tracking unique guest sessions
    },
    profileId: {
      type: String,
      required: false, // Track which active profile is chatting
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    queryType: {
      type: String,
      enum: ['general', 'player', 'club', 'country', 'league', 'transfers', 'tactics', 'predictions'],
      default: 'general',
    },
  },
  { timestamps: true }
);

// Add index to fetch quickly
chatMessageSchema.index({ userId: 1, guestId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
