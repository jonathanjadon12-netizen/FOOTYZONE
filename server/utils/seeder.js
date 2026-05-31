const mongoose = require('mongoose');
const Match = require('../config/models/Match');
const User = require('../config/models/User');
const DeletedItem = require('../config/models/DeletedItem');
const logger = require('./logger');

const seedDatabase = async () => {
  try {
    logger.info('Database Seeder: Verifying and seeding default premium football dataset library...');

    // 1. Create Default Admin Profile
    let admin = await User.findOne({ email: 'admin@footyzone.com' });
    if (!admin) {
      admin = await User.create({
        name: 'FOOTYZONE Administrator',
        email: 'admin@footyzone.com',
        password: 'JJC090354',
        role: 'admin',
        subscription: {
          plan: 'premium_yearly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          paymentStatus: 'paid'
        },
        profiles: [
          {
            profileName: 'Admin Main',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
            isKids: false
          }
        ]
      });
      logger.info('Database Seeder: Default FOOTYZONE administrator created successfully.');
    } else {
      // Admin exists; update fields while keeping activeSessions intact!
      admin.name = 'FOOTYZONE Administrator';
      admin.password = 'JJC090354';
      admin.role = 'admin';
      
      // Update subscription if needed
      admin.subscription = {
        plan: 'premium_yearly',
        startDate: admin.subscription?.startDate || new Date(),
        endDate: admin.subscription?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paymentStatus: 'paid'
      };

      // Ensure primary profile is present
      if (!admin.profiles || admin.profiles.length === 0) {
        admin.profiles = [
          {
            profileName: 'Admin Main',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
            isKids: false
          }
        ];
      } else {
        // Enforce removal of Zone Kids profile if still lingering in any active admin profiles array
        admin.profiles = admin.profiles.filter(p => p.profileName !== 'Zone Kids');
      }

      await admin.save({ validateBeforeSave: false });
      logger.info('Database Seeder: Existing FOOTYZONE administrator preserved and synchronized.');
    }

    // 2. Clean up any existing default matches with no custom uploaded video links
    const defaultTitles = [
      'Champions League Final 2024: Real Madrid vs Dortmund',
      'El Clásico: Real Madrid vs Barcelona (3-2 Drama)',
      'World Cup Final 2022: Argentina vs France (Historic Night)',
      'Champions League Thriller: Man City vs Real Madrid (4-3)',
      'Hilarious Football Bloopers & Funny Misses',
      'Ronaldinho & Neymar: Legendary Skills Compilation',
      'Craziest Tackles & Fierce Defensive Battles',
      'Craziest Fan Moments & Mascot Fails'
    ];

    const deleteResult = await Match.deleteMany({
      $or: [
        { title: { $in: defaultTitles } },
        { videoURL: { $exists: false } },
        { videoURL: null },
        { videoURL: '' }
      ]
    });
    if (deleteResult.deletedCount > 0) {
      logger.info(`Database Seeder: Cleaned up ${deleteResult.deletedCount} default matches with no custom video assets.`);
    }

    const moviesData = [];

    // Instead of bulk insertMany, check and insert default matches individually to avoid duplicating them and protect admin uploads!
    let insertedCount = 0;
    for (const movie of moviesData) {
      // Check if this item has been deleted by an admin
      const isDeletedByAdmin = await DeletedItem.findOne({ title: movie.title.trim() });
      if (isDeletedByAdmin) {
        logger.info(`Database Seeder: Skipping "${movie.title}" as it was previously deleted by the administrator.`);
        continue;
      }

      const exists = await Match.findOne({ title: movie.title });
      if (!exists) {
        await Match.create(movie);
        insertedCount++;
      }
    }

    if (insertedCount > 0) {
      logger.info(`Database Seeder: Football matches catalog loaded with ${insertedCount} new matches!`);
    } else {
      logger.info('Database Seeder: Football matches catalog already fully seeded. No new matches added.');
    }
    logger.info('Database Seeder: Seeding process completed successfully.');
  } catch (err) {
    logger.error(`Database Seeder broke: ${err.message}`);
  }
};

module.exports = seedDatabase;
