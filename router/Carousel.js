import express from 'express';
import {
  createOrUpdateCarousel,
  getCarousel,
  deleteCarousel,
} from '../controller/Carousel.js';

const carouselRouter = express.Router();

// Create or Update Carousel (only one allowed)
carouselRouter.post('/', createOrUpdateCarousel);

// Get Carousel
carouselRouter.get('/', getCarousel);

// Delete Carousel
carouselRouter.delete('/', deleteCarousel);

export default carouselRouter;