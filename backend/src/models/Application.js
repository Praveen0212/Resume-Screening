import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
      default: "Suitable",
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    skillGapPercentage: {
      type: Number,
      default: 0,
    },
    breakdown: {
      skillsScore: Number,
      skillsWeighted: Number,
      experienceScore: Number,
      experienceWeighted: Number,
      educationScore: Number,
      educationWeighted: Number,
      textSimilarityScore: Number,
      textSimilarityWeighted: Number,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interviewing", "Rejected"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same user for same job
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
