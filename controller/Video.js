import Video from "../model/Video.js";
import cloudinary from "../config/Cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Please upload a valid video file"), false);
    }
    cb(null, true);
  },
}).single("video");

export const getVideo = async (req, res) => {
  try {
    const video = await Video.findOne().sort({ createdAt: -1 });
    if (!video) {
      return res.status(404).json({ message: "No video found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch video" });
  }
};

export const uploadVideo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      const existingVideo = await Video.findOne();
      if (existingVideo) {
        return res.status(400).json({
          message: "A video already exists. Please delete it before uploading a new one.",
        });
      }

      const { title } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "videos",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      if (!uploadResult.secure_url) {
        throw new Error("Cloudinary upload failed - no URL returned");
      }

      const newVideo = new Video({
        title: title || "Untitled Video",
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });

      await newVideo.save();
      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Failed to upload video" });
    }
  });
};

export const updateVideo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title } = req.body;
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Update title if provided
      video.title = title || video.title;

      // Handle video file update if provided
      if (req.file) {
        // Delete old video from Cloudinary
        await cloudinary.uploader.destroy(video.publicId, {
          resource_type: "video",
        }).catch((error) => {
          console.error("Cloudinary deletion error:", error);
          throw new Error(`Cloudinary deletion failed: ${error.message}`);
        });

        // Upload new video to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "video",
              folder: "videos",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        if (!uploadResult.secure_url) {
          throw new Error("Cloudinary upload failed - no URL returned");
        }

        video.url = uploadResult.secure_url;
        video.publicId = uploadResult.public_id;
      }

      await video.save();
      res.json(video);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: error.message || "Failed to update video" });
    }
  });
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: "video",
    }).catch((error) => {
      console.error("Cloudinary deletion error:", error);
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    });

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: error.message || "Failed to delete video" });
  }
};