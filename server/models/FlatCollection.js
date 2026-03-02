import mongoose from 'mongoose';

const flatCollectionSchema = new mongoose.Schema({
  // Add your fields here - all at top level (flat structure)
  // Example fields:
  field1: {
    type: String,
    trim: true
  },
  field2: {
    type: Number,
    default: 0
  },
  field3: {
    type: String,
    enum: ['option1', 'option2', 'option3'],
    default: 'option1'
  },
  // createdAt field with ISODate format
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Disable timestamps to avoid duplicate createdAt/updatedAt
  // We're using explicit createdAt field instead
  timestamps: false
});

// Index for createdAt for better query performance
flatCollectionSchema.index({ createdAt: -1 });

const FlatCollection = mongoose.model('FlatCollection', flatCollectionSchema);

export default FlatCollection;
