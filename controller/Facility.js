import Facility from '../model/Facility.js';
import cloudinary from '../config/Cloudinary.js';
import { v2 as cloudinaryV2 } from 'cloudinary';

// Create new facility
export const createFacility = async (req, res) => {
    try {
        const { title, description, image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Upload image directly to Cloudinary
        const result = await cloudinaryV2.uploader.upload(image, {
            folder: 'school-facilities',
            resource_type: 'auto'
        });

        const facility = new Facility({
            title,
            description,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        await facility.save();
        res.status(201).json(facility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all facilities
export const getFacilities = async (req, res) => {
    try {
        const facilities = await Facility.find().sort({ createdAt: -1 });
        res.status(200).json(facilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single facility
export const getFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.status(200).json(facility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update facility
export const updateFacility = async (req, res) => {
    try {
        const { title, description, image } = req.body;
        
        const facility = await Facility.findById(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        let imageData = facility.image;

        if (image && image !== facility.image.url) {
            // Delete old image from Cloudinary
            await cloudinaryV2.uploader.destroy(facility.image.public_id);
            
            // Upload new image
            const result = await cloudinaryV2.uploader.upload(image, {
                folder: 'school-facilities',
                resource_type: 'auto'
            });
            
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const updatedFacility = await Facility.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                image: imageData
            },
            { new: true }
        );

        res.status(200).json(updatedFacility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete facility
export const deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        // Delete image from Cloudinary
        await cloudinaryV2.uploader.destroy(facility.image.public_id);
        
        await Facility.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Facility deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};