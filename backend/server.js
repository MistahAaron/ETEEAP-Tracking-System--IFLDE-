require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { GridFSBucket, ObjectId } = require("mongodb");
const conn = mongoose.connection;

const app = express();

// Configurations
const connectDB = require("./config/db");
const { PORT } = require("./config/constants");

// Routes
const publicRoutes = require("./routes");
const applicants = require("./routes/applicantRoutes");
const admins = require("./routes/adminRoutes");
const assessors = require("./routes/assessorRoutes");

// ================== Middleware Setup ================== //
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost",
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ================== Database Connection ================== //
connectDB();

// ================== Authentication Middlewares ================== //
const auth = {
  // Verify JWT token
  protect: async (req, res, next) => {
    const token = req.cookies.token || 
                 req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
  },

  // Check user role
  authorize: (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Forbidden: Requires ${allowedRoles.join(' or ')} role` 
      });
    }
    next();
  }
};

// ================== Unified Authentication Routes ================== //
app.post('/api/auth/:role/login', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password required' 
    });
  }

  try {
    // Role-to-model mapping
    const models = {
      applicant: 'Applicant',
      admin: 'Admin',
      assessor: 'Assessor'
    };
    
    if (!models[role]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified' 
      });
    }

    // Find user with password
    const user = await mongoose.model(models[role])
      .findOne({ email })
      .select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role,
        email: user.email,
        name: user.name || ''
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Secure cookie settings
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000 // 24 hours
    });

    // Sanitize user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse,
      redirect: `/${role}/dashboard`
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during authentication' 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ================== Protected Routes ================== //
app.use('/api/applicants', auth.protect, auth.authorize('applicant'), applicants);
app.use('/api/admins', auth.protect, auth.authorize('admin'), admins);
app.use('/api/assessors', auth.protect, auth.authorize('assessor'), assessors);

// ================== Public Routes ================== //
app.use("/", publicRoutes);

// ================== Error Handling ================== //
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================== Server Startup ================== //
app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV || 'development'} mode
  ➜ REST API: http://localhost:${PORT}/api
  ➜ Static files: http://localhost:${PORT}/public
  `);
});
