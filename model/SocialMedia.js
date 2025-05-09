import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  links: [{
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        try {
          new URL(v);
          return true;
        } catch (error) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
socialMediaSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);

export default SocialMedia;