import cloudinary from "../config/Cloudinary.js";
import Event from "../model/Event.js";

export const CreateEvent = async (req, res) => {
    try {
        const { name, description } = req.body;
        let mainImageData = null;

        // Handle main image upload
        if (req.body.mainImage?.url) {
            const mainImageResult = await cloudinary.uploader.upload(req.body.mainImage.url, {
                folder: "event_images",
                resource_type: "auto"
            });
            mainImageData = {
                url: mainImageResult.secure_url,
                public_id: mainImageResult.public_id
            };
        }

        // Process additional images
        let additionalImages = [];
        if (req.body.images && req.body.images.length > 0) {
            additionalImages = await Promise.all(
                req.body.images.map(async (image) => {
                    if (image.url) {
                        const result = await cloudinary.uploader.upload(image.url, {
                            folder: "event_images",
                            resource_type: "auto"
                        });
                        return {
                            url: result.secure_url,
                            public_id: result.public_id
                        };
                    }
                    return image;
                })
            );
        }

        const event = new Event({
            name,
            description,
            mainImage: mainImageData,
            images: additionalImages
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(400).json({ 
            success: false,
            message: "Failed to create event",
            error: error.message 
        });
    }
};

export const GetAllEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; // Default to 6 if not specified
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        const query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
            ];
        }

        const events = await Event.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalEvents = await Event.countDocuments(query);
        const totalPages = Math.ceil(totalEvents / limit);

        res.status(200).json({
            success: true,
            events,
            currentPage: page,
            totalPages,
            totalEvents,
        });
    } catch (error) {
        console.error("Error in GetAllEvents:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const GetEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error("Error in GetEventById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const UpdateEvent = async (req, res) => {
    try {
        const { name, description, mainImage, images } = req.body;
        
        const existingEvent = await Event.findById(req.params.id);
        if (!existingEvent) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        let mainImageObj = existingEvent.mainImage;

        // Handle main image update
        if (mainImage) {
            if (mainImage.url && mainImage.url.startsWith('data:image')) {
                // Delete old image if exists
                if (existingEvent.mainImage?.public_id) {
                    await cloudinary.uploader.destroy(existingEvent.mainImage.public_id);
                }
                // Upload new image
                const mainImageResult = await cloudinary.uploader.upload(mainImage.url, {
                    folder: "event_images",
                    resource_type: "auto"
                });
                mainImageObj = {
                    url: mainImageResult.secure_url,
                    public_id: mainImageResult.public_id
                };
            } else if (mainImage.url) {
                // Keep existing URL if no new base64 data
                mainImageObj = {
                    url: mainImage.url,
                    public_id: mainImage.public_id || existingEvent.mainImage?.public_id
                };
            }
        } else if (mainImage === null) {
            // Delete old image if explicitly set to null
            if (existingEvent.mainImage?.public_id) {
                await cloudinary.uploader.destroy(existingEvent.mainImage.public_id);
            }
            mainImageObj = null;
        }

        // Process additional images
        let updatedImages = existingEvent.images;
        if (images) {
            // Delete old images if new ones are provided
            if (existingEvent.images.length > 0) {
                for (const img of existingEvent.images) {
                    if (img.public_id) {
                        await cloudinary.uploader.destroy(img.public_id);
                    }
                }
            }
            
            updatedImages = await Promise.all(
                images.map(async (image) => {
                    if (image.url && image.url.startsWith('data:image')) {
                        const result = await cloudinary.uploader.upload(image.url, {
                            folder: "event_images",
                            resource_type: "auto"
                        });
                        return {
                            url: result.secure_url,
                            public_id: result.public_id
                        };
                    }
                    return {
                        url: image.url,
                        public_id: image.public_id || null
                    };
                })
            );
        }

        // Update the event with new data
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                name: name || existingEvent.name,
                description: description || existingEvent.description,
                mainImage: mainImageObj,
                images: updatedImages
            },
            { new: true }
        );

        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const DeleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Delete main image from Cloudinary if exists
        if (event.mainImage?.public_id) {
            await cloudinary.uploader.destroy(event.mainImage.public_id);
        }

        // Delete all additional images from Cloudinary if they exist
        for (const image of event.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        // Delete the event from database
        await Event.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const DeleteEventImage = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Find the image to delete
        const imageIndex = event.images.findIndex(
            img => img.public_id === req.params.imageId
        );

        if (imageIndex === -1) {
            return res.status(404).json({ success: false, message: "Image not found" });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(req.params.imageId);

        // Remove from array
        event.images.splice(imageIndex, 1);

        await event.save();
        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error("Error deleting event image:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};