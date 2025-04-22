import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better performance on date queries
noticeSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

// Middleware to prevent saving if another notice is active
noticeSchema.pre('save', async function(next) {
  if (this.isActive) {
    const activeNotice = await mongoose.model('Notice').findOne({
      isActive: true,
      _id: { $ne: this._id },
      endDate: { $gt: new Date() }
    });
    
    if (activeNotice) {
      throw new Error('Another notice is already active. Deactivate it first or wait for its end date.');
    }
  }
  next();
});

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;