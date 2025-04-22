import Gallery from '../model/Gallery.js';
import cloudinary from '../config/Cloudinary.js';

// Create a new gallery with images
export const createGallery = async (req, res) => {
  try {
    const { title, description, folderName, images } = req.body;

    // Validate input
    if (!title || !folderName || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Title, folder name, and at least one image are required' });
    }

    // Validate image format
    for (const image of images) {
      if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
        return res.status(400).json({ message: 'All images must be valid base64 strings' });
      }
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    
    for (const image of images) {
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder: `gallery/${folderName}`,
          resource_type: 'auto',
        });
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          folder: `gallery/${folderName}`,
        });
      } catch (error) {
        console.error(`Error uploading image to Cloudinary: ${error.message || error}`);
        // Continue with other images even if one fails
        continue;
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({ message: 'Failed to upload any images to Cloudinary' });
    }

    // Create new gallery
    const newGallery = new Gallery({
      title,
      description,
      folderName,
      images: uploadedImages,
    });

    await newGallery.save();

    res.status(201).json({
      success: true,
      message: 'Gallery created successfully',
      data: newGallery,
    });
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all galleries
export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: galleries.length,
      data: galleries
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single gallery by ID
export const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a gallery
export const updateGallery = async (req, res) => {
  try {
    const { title, description, folderName, imagesToAdd, imagesToDelete } = req.body;
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Update basic info
    if (title) gallery.title = title;
    if (description) gallery.description = description;
    if (folderName) gallery.folderName = folderName;

    // Delete images if specified
    if (imagesToDelete && imagesToDelete.length > 0) {
      // Delete from Cloudinary
      for (const publicId of imagesToDelete) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Error deleting image ${publicId}:`, error);
        }
      }
      
      // Remove from the array
      gallery.images = gallery.images.filter(
        img => !imagesToDelete.includes(img.public_id)
      );
    }

    // Add new images if specified
    // From updateGallery controller
if (imagesToAdd && imagesToAdd.length > 0) {
  const uploadedImages = [];
  
  for (const image of imagesToAdd) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: `gallery/${gallery.folderName}`,
        resource_type: 'auto'
      });
      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        folder: `gallery/${gallery.folderName}`
      });
    } catch (error) {
      console.error(`Error uploading new image: ${error.message}`);
      continue;
    }
  }
  gallery.images.push(...uploadedImages);
}

    await gallery.save();

    res.status(200).json({
      success: true,
      message: 'Gallery updated successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a gallery
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Delete all images from Cloudinary first
    for (const image of gallery.images) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.error(`Error deleting image ${image.public_id}:`, error);
      }
    }

    // Delete the gallery from database
    await Gallery.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};