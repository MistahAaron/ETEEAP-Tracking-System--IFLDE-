const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const applicantSchema = new mongoose.Schema({
  applicantId: {
    type: String,
    unique: true,
    uppercase: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false // Never returned in queries
  },
  status: { 
    type: String, 
    default: "Pending Review",
    enum: [
      "Pending Review", 
      "Under Assessment", 
      "Evaluated - Passed", 
      "Evaluated - Failed", 
      "Rejected",
      "Approved"
    ]
  },
  assignedAssessors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessor' 
  }],
  evaluations: [{
    assessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessor',
      required: true
    },
    educationalQualification: {
      score: { type: Number, min: 0, max: 20 },
      comments: String,
      breakdown: [{
        criteria: String,
        points: Number
      }]
    },
    workExperience: {
      score: { type: Number, min: 0, max: 40 },
      comments: String,
      breakdown: [{
        criteria: String,
        points: Number
      }]
    },
    professionalAchievements: {
      score: { type: Number, min: 0, max: 25 },
      comments: String,
      breakdown: [{
        criteria: String,
        points: Number
      }]
    },
    interview: {
      score: { type: Number, min: 0, max: 15 },
      comments: String,
      breakdown: [{
        criteria: String,
        points: Number
      }]
    },
    totalScore: { type: Number, min: 0, max: 100 },
    isPassed: Boolean,
    status: {
      type: String,
      enum: ['draft', 'finalized'],
      default: 'draft'
    },
    evaluatedAt: { 
      type: Date, 
      default: Date.now 
    },
    finalizedAt: Date,
    finalComments: String
  }],
  evaluationComments: [{
    assessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessor'
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    },
    evaluationId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  isPassed: Boolean,
  personalInfo: {
    firstname: String,
    middlename: String,
    lastname: String,
    suffix: String,
    gender: String,
    age: Number,
    occupation: String,
    nationality: String,
    civilstatus: String,
    birthDate: Date,
    birthplace: String,
    mobileNumber: String,
    telephoneNumber: String,
    emailAddress: String,
    country: String,
    province: String,
    city: String,
    street: String,
    zipCode: String,
    firstPriorityCourse: String,
    secondPriorityCourse: String,
    thirdPriorityCourse: String,
  },
  files: [{
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: String,
    type: String,
    label: {
        type: String,
        default: 'initial-submission'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
  }]
}, { 
  collection: "Applicants",
  timestamps: true // Replaces manual createdAt/updatedAt
});

// Password hashing middleware
applicantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
applicantSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
applicantSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Applicant", applicantSchema);
