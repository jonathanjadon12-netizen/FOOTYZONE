const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Null for guest sessions
    },
    guestId: {
      type: String,
      required: false,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['player', 'club', 'league', 'country', 'general'],
      default: 'general',
    },
  },
  { timestamps: true }
);

searchHistorySchema.index({ userId: 1, guestId: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
