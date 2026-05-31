const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    genres: [
      {
        type: String,
        required: true,
      },
    ],
    videoURL: {
      type: String,
      required: true,
    },
    trailerURL: {
      type: String,
      required: true,
    },
    cast: [
      {
        type: String,
      },
    ],
    duration: {
      type: Number, // in minutes
      required: true,
    },
    rating: {
      type: String, // G, PG, PG-13, R, TV-MA
      required: true,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    qualityOptions: {
      type: [String],
      default: ['480p', '720p', '1080p', '4K'],
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    isOriginal: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: 'football' }
);

module.exports = mongoose.model('Match', matchSchema, 'football');
