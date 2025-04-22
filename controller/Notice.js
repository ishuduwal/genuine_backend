import Notice from '../model/Notice.js';
import cloudinary from '../config/Cloudinary.js';
import fs from 'fs';

export const createNotice = async (req, res) => {
  try {
    const { title, description, startDate, endDate, isActive = true, image } = req.body;
    
    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date, and end date are required'
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check if there's already an active notice
    if (isActive) {
      const activeNotice = await Notice.findOne({
        isActive: true,
        endDate: { $gt: new Date() }
      });
      
      if (activeNotice) {
        return res.status(400).json({
          success: false,
          message: 'Another notice is already active. Deactivate it first or wait for its end date.'
        });
      }
    }

    let imageUrl = null;
    if (image) {
      try {
        // Upload base64 image directly to Cloudinary
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`, {
          folder: 'notices'
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image to Cloudinary'
        });
      }
    }

    const notice = new Notice({
      title,
      description: description || null,
      image: imageUrl,
      startDate,
      endDate,
      isActive
    });

    await notice.save();

    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create notice'
    });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const { title, description, startDate, endDate, isActive, image } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if trying to activate while another notice is active
    if (isActive === true || (isActive === undefined && notice.isActive === true)) {
      const activeNotice = await Notice.findOne({
        isActive: true,
        endDate: { $gt: new Date() },
        _id: { $ne: notice._id }
      });
      
      if (activeNotice) {
        return res.status(400).json({
          success: false,
          message: 'Another notice is already active. Deactivate it first or wait for its end date.'
        });
      }
    }

    let imageUrl = notice.image;
    if (image) {
      try {
        // Delete old image from Cloudinary if exists
        if (notice.image) {
          const publicId = notice.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`notices/${publicId}`);
        }
        
        // Upload new image
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`, {
          folder: 'notices'
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to update image'
        });
      }
    }

    notice.title = title || notice.title;
    notice.description = description !== undefined ? description : notice.description;
    notice.startDate = startDate || notice.startDate;
    notice.endDate = endDate || notice.endDate;
    notice.isActive = isActive !== undefined ? isActive : notice.isActive;
    notice.image = imageUrl;

    await notice.save();

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update notice'
    });
  }
};

// Get current active notice
export const getCurrentNotice = async (req, res) => {
  try {
    const currentDate = new Date();
    const notice = await Notice.findOne({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: notice || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all active notices (where current date is between start and end date)
export const getActiveNotices = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const notices = await Notice.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all notices (for admin)
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single notice by ID
export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Toggle notice active status
export const toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // If trying to activate, check if another notice is active
    if (!notice.isActive) {
      const activeNotice = await Notice.findOne({
        isActive: true,
        endDate: { $gt: new Date() },
        _id: { $ne: notice._id }
      });
      
      if (activeNotice) {
        return res.status(400).json({
          success: false,
          message: 'Another notice is already active. Deactivate it first or wait for its end date.'
        });
      }
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (notice.image) {
      const publicId = notice.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`notices/${publicId}`);
    }

    await notice.remove();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};