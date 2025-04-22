import Admin from "../model/Admin.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


export const Signup = async (req, res) => {
  try {
    const { email, password, isAdmin = false } = req.body;

    // Check if user exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'User already exists' 
      });
    }

    // Create new user
    const newUser = new Admin({ email, password, isAdmin });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      user: { 
        id: newUser._id,
        email: newUser.email,
        isAdmin: newUser.isAdmin 
      },
      token 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User not found' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      user: { 
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin 
      },
      token 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Config Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Utility functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  try {
    const user = await Admin.findById(req.user.id); // From auth middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Change Password OTP',
      text: `Your OTP to change your password is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Change password with OTP
export const changePassword = async (req, res) => {
  const { otp, newPassword } = req.body;

  try {
    const user = await Admin.findById(req.user.id); // From auth middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    user.otp = null; // Clear OTP
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};