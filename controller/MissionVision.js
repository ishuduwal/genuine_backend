import MissionVision from '../model/MissionVision.js';
import { v2 as cloudinary } from 'cloudinary';

// Create MissionVision (only one document should exist)
export const createMissionVision = async (req, res) => {
    try {
        const { 
            overview, 
            whoWeAre, 
            mission, 
            vision, 
            overviewTitle, 
            whoWeAreTitle, 
            missionvisionTitle,
            overviewImage,
            whoWeAreImage,
            missionVisionImage
        } = req.body;
        
        // Check if document already exists
        const existing = await MissionVision.findOne();
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'MissionVision already exists. Use update instead.'
            });
        }

        // Upload images to Cloudinary if they exist
        const uploadImage = async (imageData) => {
            if (!imageData) return '';
            try {
                const result = await cloudinary.uploader.upload(imageData, {
                    folder: 'mission-vision'
                });
                return result.secure_url;
            } catch (error) {
                console.error('Error uploading image:', error);
                return '';
            }
        };

        const [overviewImageUrl, whoWeAreImageUrl, missionVisionImageUrl] = await Promise.all([
            uploadImage(overviewImage),
            uploadImage(whoWeAreImage),
            uploadImage(missionVisionImage)
        ]);

        const missionVision = new MissionVision({
            overview,
            whoWeAre,
            mission,
            vision,
            overviewTitle, 
            whoWeAreTitle, 
            missionvisionTitle,
            overviewImage: overviewImageUrl,
            whoWeAreImage: whoWeAreImageUrl,
            missionVisionImage: missionVisionImageUrl
        });

        await missionVision.save();
        res.status(201).json({
            success: true,
            data: missionVision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get MissionVision
export const getMissionVision = async (req, res) => {
    try {
        const missionVision = await MissionVision.findOne();
        res.status(200).json({
            success: true,
            data: missionVision || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update MissionVision
export const updateMissionVision = async (req, res) => {
    try {
        const { 
            overview, 
            whoWeAre, 
            mission, 
            vision, 
            overviewTitle, 
            whoWeAreTitle, 
            missionvisionTitle,
            overviewImage,
            whoWeAreImage,
            missionVisionImage,
            deleteOverviewImage,
            deleteWhoWeAreImage,
            deleteMissionVisionImage
        } = req.body;
        
        const missionVision = await MissionVision.findById(req.params.id);

        if (!missionVision) {
            return res.status(404).json({
                success: false,
                message: 'MissionVision not found'
            });
        }

        // Handle image uploads and deletions
        const handleImageUpdate = async (currentImage, newImageData, shouldDelete) => {
            if (shouldDelete && currentImage) {
                // Extract public_id from URL
                const publicId = currentImage.split('/').pop().split('.')[0];
                try {
                    await cloudinary.uploader.destroy(`mission-vision/${publicId}`);
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
                return '';
            }
            
            if (newImageData) {
                try {
                    const result = await cloudinary.uploader.upload(newImageData, {
                        folder: 'mission-vision'
                    });
                    // Delete old image if exists
                    if (currentImage) {
                        const publicId = currentImage.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(`mission-vision/${publicId}`);
                    }
                    return result.secure_url;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return currentImage;
                }
            }
            return currentImage;
        };

        const [updatedOverviewImage, updatedWhoWeAreImage, updatedMissionVisionImage] = await Promise.all([
            handleImageUpdate(
                missionVision.overviewImage, 
                overviewImage, 
                deleteOverviewImage
            ),
            handleImageUpdate(
                missionVision.whoWeAreImage, 
                whoWeAreImage, 
                deleteWhoWeAreImage
            ),
            handleImageUpdate(
                missionVision.missionVisionImage, 
                missionVisionImage, 
                deleteMissionVisionImage
            )
        ]);

        // Update fields
        missionVision.overview = overview || missionVision.overview;
        missionVision.whoWeAre = whoWeAre || missionVision.whoWeAre;
        missionVision.mission = mission || missionVision.mission;
        missionVision.vision = vision || missionVision.vision;
        missionVision.overviewTitle = overviewTitle || missionVision.overviewTitle;
        missionVision.whoWeAreTitle = whoWeAreTitle || missionVision.whoWeAreTitle;
        missionVision.missionvisionTitle = missionvisionTitle || missionVision.missionvisionTitle;
        missionVision.overviewImage = updatedOverviewImage;
        missionVision.whoWeAreImage = updatedWhoWeAreImage;
        missionVision.missionVisionImage = updatedMissionVisionImage;

        await missionVision.save();

        res.status(200).json({
            success: true,
            data: missionVision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};