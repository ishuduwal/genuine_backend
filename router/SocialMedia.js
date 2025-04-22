import express from 'express';
import {
  createSocialMedia,
  getAllSocialMedia,
  getSocialMediaById,
  updateSocialMedia,
  deleteSocialMedia,
} from '../controller/SocialMedia.js';

const socialMediaRouter = express.Router();

// Create a new social media post
socialMediaRouter.post('/', createSocialMedia);

// Get all social media posts
socialMediaRouter.get('/', getAllSocialMedia);

// Get a single social media post by ID
socialMediaRouter.get('/:id', getSocialMediaById);

// Update a social media post
socialMediaRouter.put('/:id', updateSocialMedia);

// Delete a social media post
socialMediaRouter.delete('/:id', deleteSocialMedia);

export default socialMediaRouter;