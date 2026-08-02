import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seederService from './services/ProductSeederService.js';

dotenv.config();

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nutrizen';
    console.log(`🔌 Connecting to MongoDB at ${mongoUri.split('@')[1] || mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.');

    // Check arguments for refresh flag
    const isRefresh = process.argv.includes('--refresh');
    
    // Check for specific categories (e.g. node seed.js --categories="Chips,Snacks")
    let specificCategories = null;
    const catArg = process.argv.find(arg => arg.startsWith('--categories='));
    if (catArg) {
      specificCategories = catArg.split('=')[1].split(',').map(c => c.trim());
      console.log(`🎯 Targeting specific categories: ${specificCategories.join(', ')}`);
    }

    await seederService.run(isRefresh, specificCategories);

    console.log('👋 Exiting seeder...');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection or seeding failed:', error.message);
    process.exit(1);
  }
};

runSeed();
