const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  profileName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
  },
  watchHistory: [
    {
      matchId: mongoose.Schema.Types.ObjectId,
      playhead: Number, // saved playtime in seconds
      lastWatched: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  language: {
    type: String,
    default: 'en',
  },
  contentPreference: {
    type: String,
    enum: ['all', 'kids', 'teens'],
    default: 'all',
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return !/\d/.test(v);
        },
        message: 'Name should not contain numbers.'
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address.'
      }
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
      },
    ],
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    activeSessions: [
      {
        token: String,
        ipAddress: String,
        device: String,
        lastActive: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    profiles: [profileSchema],
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium_monthly', 'premium_yearly'],
        default: 'free',
      },
      startDate: Date,
      endDate: Date,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'unpaid'],
        default: 'pending',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);
