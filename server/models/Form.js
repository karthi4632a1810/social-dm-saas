import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  paragraph: {
    type: String,
    trim: true
  },
  buttonColor: {
    type: String,
    default: '#3b82f6', // Default blue color
    trim: true
  },
  fields: [{
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['title', 'paragraph', 'text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    columnSpan: {
      type: Number,
      default: 12,
      min: 1,
      max: 12
    },
    options: [String], // For select, radio, checkbox
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  inTrash: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Form = mongoose.model('Form', formSchema);

export default Form;
