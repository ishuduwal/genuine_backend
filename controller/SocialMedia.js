import SocialMedia from '../model/SocialMedia.js';
import cloudinary from '../config/Cloudinary.js';

// Create a new social media post
export const createSocialMedia = async (req, res) => {
  try {
    const { title, image, links } = req.body;

    // Validate input
    if (!title || !image) {
      return res.status(400).json({ message: 'Title and image are required' });
    }
    if (!image.startsWith('data:image')) {
      return res.status(400).json({ message: 'Image must be a valid base64 string' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'social_media',
      resource_type: 'image',
    });

    const newSocialMedia = new SocialMedia({
      title,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      links: links || [],
    });

    await newSocialMedia.save();

    res.status(201).json({
      success: true,
      message: 'Social media post created successfully',
      data: newSocialMedia,
    });
  } catch (error) {
    console.error('Error creating social media post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all social media posts
export const getAllSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: socialMedia.length,
      data: socialMedia,
    });
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single social media post by ID
export const getSocialMediaById = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media post not found' });
    }
    res.status(200).json({
      success: true,
      data: socialMedia,
    });
  } catch (error) {
    console.error('Error fetching social media post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a social media post
export const updateSocialMedia = async (req, res) => {
  try {
    const { title, image, links } = req.body;
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media post not found' });
    }

    // Update fields
    if (title) socialMedia.title = title;
    if (links) socialMedia.links = links;

    // If a new image is provided, delete the old one and upload the new one
    if (image && image.startsWith('data:image')) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(socialMedia.image.public_id);

      // Upload new image
      const result = await cloudinary.uploader.upload(image, {
        folder: 'social_media',
        resource_type: 'image',
      });

      socialMedia.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await socialMedia.save();

    res.status(200).json({
      success: true,
      message: 'Social media post updated successfully',
      data: socialMedia,
    });
  } catch (error) {
    console.error('Error updating social media post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a social media post
export const deleteSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media post not found' });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(socialMedia.image.public_id);

    // Delete from database
    await SocialMedia.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Social media post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting social media post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};