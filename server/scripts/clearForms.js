import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from '../models/Form.js';

// Load environment variables
dotenv.config();

const clearAllForms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Delete all forms
    const result = await Form.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} form(s) from the database.`);
    console.log('Database is now fresh!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing forms:', error);
    process.exit(1);
  }
};

// Run the script
clearAllForms();
