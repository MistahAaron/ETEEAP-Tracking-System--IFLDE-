const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/fileUpload");
const Applicant = require("../models/Applicant");

// Validation middleware
const validateApplicant = async (req, res, next) => {
  const { email, password } = req.body;
  
  // Email validation
  if (email) {
    const exists = await Applicant.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        error: "Email already in use" 
      });
    }
  }

  // Password validation
  if (password && password.length < 8) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 8 characters"
    });
  }

  next();
};

// Public routes
router.post("/api/register", validateApplicant, applicantController.register);
router.post("/api/login", applicantController.login);

// Protected routes (require authentication)
router.use(protect);
router.use(authorize('applicant'));

// Document management routes
router.post(
  "/api/submit-documents",
  upload.array("files"),
  applicantController.fileSubmit
);
router.get("/api/fetch-documents/:id", applicantController.fileFetch);
router.delete("/api/delete-documents/:id", applicantController.fileDelete);

// Profile management routes
router.post("/api/update-personal-info", validateApplicant, applicantController.updateInfo);
router.post(
  "/api/update-profile",
  upload.single("profilePic"),
  applicantController.updateProfile
);

// Profile access routes
router.get("/api/profile/:id", applicantController.profileId);
router.get("/api/profile-pic/:userId", applicantController.getProfilePic);
router.get(
  "/api/fetch-user-files/:userId",
  applicantController.fetchUserFiles
);

// Auth status routes
router.get("/applicant/auth-status", applicantController.authStatus);
router.post("/applicant/logout", applicantController.logout);

module.exports = router;
