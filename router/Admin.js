import express from "express";
import { 
  changePassword, 
  Login, 
  sendOTP, 
  Signup 
} from "../controller/Admin.js";
import { authenticateAdmin } from "../middleware/Auth.js";

const adminRouter = express.Router();

// Input validation middleware
const validateSignup = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email and password are required' 
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email and password are required' 
    });
  }
  next();
};

// Routes
adminRouter.post('/signup', validateSignup, Signup);
adminRouter.post('/login', validateLogin, Login);
adminRouter.post('/send-otp', authenticateAdmin, sendOTP);
adminRouter.post('/change-password', authenticateAdmin, changePassword);

export default adminRouter;