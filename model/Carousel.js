import mongoose from 'mongoose';

const carouselSchema = new mongoose.Schema({
  slides: {
    type: [
      {
        image: {
          public_id: String,
          url: String,
        },
        title: {
          type: String,
          maxlength: 100,
          default: ''
        },
        description: {
          type: String,
          maxlength: 200,
          default: ''
        },
      },
    ],
    validate: {
      validator: function (array) {
        return array.length <= 5;
      },
      message: 'Carousel can have up to 5 slides.',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent creating more than one carousel
carouselSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  const count = await mongoose.models.Carousel.countDocuments();
  if (count >= 1) {
    throw new Error('Only one carousel is allowed');
  }
  next();
});

const Carousel = mongoose.model('Carousel', carouselSchema);

export default Carousel;