import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from '../models/Form.js';
import Link from '../models/Link.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import FlatCollection from '../models/FlatCollection.js';

// Load environment variables
dotenv.config();

const clearAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected\n');
    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('Clearing all collections...\n');

    // Delete all documents from each collection
    const results = {
      forms: await Form.deleteMany({}),
      links: await Link.deleteMany({}),
      leads: await Lead.deleteMany({}),
      users: await User.deleteMany({}),
      flatCollections: await FlatCollection.deleteMany({})
    };
    
    console.log('✅ Successfully cleared all data:');
    console.log(`   - Forms: ${results.forms.deletedCount} deleted`);
    console.log(`   - Links: ${results.links.deletedCount} deleted`);
    console.log(`   - Leads: ${results.leads.deletedCount} deleted`);
    console.log(`   - Users: ${results.users.deletedCount} deleted`);
    console.log(`   - FlatCollections: ${results.flatCollections.deletedCount} deleted`);
    
    const totalDeleted = 
      results.forms.deletedCount + 
      results.links.deletedCount + 
      results.leads.deletedCount + 
      results.users.deletedCount + 
      results.flatCollections.deletedCount;
    
    console.log(`\n📊 Total documents deleted: ${totalDeleted}`);
    console.log('✨ Database is now fresh and empty!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Run the script
clearAllData();
