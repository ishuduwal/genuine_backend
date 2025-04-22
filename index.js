import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminRouter from "./router/Admin.js";
import eventRouter from "./router/Event.js";
import messageRouter from "./router/Message.js";
import noticeRouter from "./router/Notice.js";
import testimonialsRouter from "./router/Testimonials.js";
import carouselRouter from "./router/Carousel.js";
import galleryRouter from "./router/Gallery.js";
import socialMediaRouter from "./router/SocialMedia.js";
import multer from "multer"; // Add multer import
import missionvisionRouter from "./router/MissionVision.js";
import facilityRouter from "./router/Facility.js";
import teacherRouter from "./router/Teacher.js";
import departmentRouter from "./router/Department.js";

// Initialize Express app
const app = express();

// Load environment variables
dotenv.config();

// Configure Multer for handling multipart/form-data
const upload = multer({ dest: "uploads/" }); // Temporary storage for files (if any)

// Middleware Setup
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 100000
}));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Request Logger (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// API Routes
app.use('/api/admin', upload.none(), adminRouter); // Use multer for admin routes (no files expected)
app.use('/api/events', eventRouter);
app.use('/api/message', messageRouter);
app.use('/api/notice', noticeRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/carousel', carouselRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/socialmedia', socialMediaRouter);
app.use('/api/mission-vision', missionvisionRouter);
app.use('/api/facilities', facilityRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/departments', departmentRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Database Connection and Server Start
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URI || process.env.mongodb)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📄 API Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;