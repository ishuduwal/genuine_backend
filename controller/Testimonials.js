import Testimonial from '../model/Testimonials.js';
import cloudinary from '../config/Cloudinary.js';

// Create a new testimonial
// Create a new testimonial
export const createTestimonial = async (req, res) => {
    try {
        const { name, position, description, image } = req.body;
        
        // Validate required fields
        if (!name || !position || !description) {
            return res.status(400).json({ 
                success: false,
                message: 'Name, position, and description are required' 
            });
        }

        let imageUrl = null;
        if (image && typeof image === 'string' && image.includes('base64')) {
            try {
                // For direct API upload, Cloudinary expects the base64 string without the data URL prefix
                const base64Data = image.includes('data:') 
                    ? image 
                    : `data:image/jpeg;base64,${image}`;
                
                const result = await cloudinary.uploader.upload(base64Data, {
                    folder: 'school-testimonials'
                });
                
                imageUrl = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload image to Cloudinary'
                });
            }
        }

        const testimonial = new Testimonial({
            name,
            position,
            description,
            image: imageUrl
        });

        await testimonial.save();
        res.status(201).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create testimonial'
        });
    }
};

// Get all testimonials
export const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single testimonial
export const getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        res.status(200).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update testimonial
// Update testimonial
export const updateTestimonial = async (req, res) => {
    try {
        const { name, position, description, image } = req.body;
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        let imageData = testimonial.image;
        if (image && typeof image === 'string' && image.includes('base64')) {
            try {
                // Delete old image from Cloudinary if exists
                if (testimonial.image?.public_id) {
                    await cloudinary.uploader.destroy(testimonial.image.public_id);
                }
                
                // For direct API upload, use the complete data URL or add the prefix if needed
                const base64Data = image.includes('data:') 
                    ? image 
                    : `data:image/jpeg;base64,${image}`;
                
                const result = await cloudinary.uploader.upload(base64Data, {
                    folder: 'school-testimonials'
                });
                
                imageData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update image'
                });
            }
        }

        testimonial.name = name || testimonial.name;
        testimonial.position = position || testimonial.position;
        testimonial.description = description || testimonial.description;
        testimonial.image = imageData;

        await testimonial.save();

        res.status(200).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update testimonial'
        });
    }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        // Delete image from Cloudinary if exists
        if (testimonial.image?.public_id) {
            await cloudinary.uploader.destroy(testimonial.image.public_id);
        }

        await testimonial.remove();
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};