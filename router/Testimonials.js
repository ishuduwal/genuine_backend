import express from 'express';
import {
    createTestimonial,
    getAllTestimonials,
    getTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../controller/Testimonials.js';

const testimonialsRouter = express.Router();

testimonialsRouter.post('/', createTestimonial);
testimonialsRouter.get('/', getAllTestimonials);
testimonialsRouter.get('/:id', getTestimonial);
testimonialsRouter.put('/:id', updateTestimonial);
testimonialsRouter.delete('/:id', deleteTestimonial);

export default testimonialsRouter;