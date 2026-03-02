import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  number: {
    type: String,
    required: false,
    trim: true
  },
  link: {
    type: String,
    required: false,
    trim: true
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'qualified', 'working', 'proposal sent', 'not interested', 'closed'],
    default: 'pending'
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  platform: {
    type: String,
    required: false,
    enum: ['Instagram', 'Facebook', 'Whatsapp', 'Youtube', 'Linkedin', 'Reddit', 'Telegram', 'Threads', 'TikTok', 'TwitterX'],
    trim: true,
    default: 'Website'
  },
  location: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
