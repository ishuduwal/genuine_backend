import Carousel from '../model/Carousel.js';
import cloudinary from '../config/Cloudinary.js';

export const createOrUpdateCarousel = async (req, res) => {
  try {
    const { slides } = req.body;
    
    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ message: 'Please provide slides data' });
    }

    let carousel = await Carousel.findOne();

    if (!carousel) {
      // Create new carousel if none exists
      carousel = new Carousel({ slides: [] });
    }

    const updatedSlides = await Promise.all(slides.map(async (newSlide, index) => {
      const existingSlide = carousel.slides[index] || {};
      
      // Handle image upload if provided
      let imageData = existingSlide.image || {};
      if (newSlide.image && newSlide.image.startsWith('data:image')) {
        // Delete old image from Cloudinary if exists
        if (existingSlide.image?.public_id) {
          await cloudinary.uploader.destroy(existingSlide.image.public_id);
        }
        
        // Upload new image
        const result = await cloudinary.uploader.upload(newSlide.image, {
          folder: 'carousel',
        });
        
        imageData = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      return {
        image: imageData,
        title: newSlide.title || '',
        description: newSlide.description || '',
        _id: existingSlide._id
      };
    }));

    carousel.slides = updatedSlides;
    await carousel.save();
    
    return res.status(200).json(carousel);
  } catch (error) {
    console.error('Error in createOrUpdateCarousel:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getCarousel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res.status(404).json({ message: 'Carousel not found' });
    }
    res.status(200).json(carousel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCarousel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res.status(404).json({ message: 'Carousel not found' });
    }

    // Delete images from Cloudinary
    for (const slide of carousel.slides) {
      if (slide.image?.public_id) {
        await cloudinary.uploader.destroy(slide.image.public_id);
      }
    }

    await carousel.deleteOne();
    res.status(200).json({ message: 'Carousel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};