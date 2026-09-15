import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Remote", "Hybrid", "Contract", "Internship"],
      default: "Full-time",
    },
    experienceRequired: {
      type: Number,
      required: [true, "Experience required in years"],
      default: 0,
    },
    requiredSkills: {
      type: [String],
      required: [true, "At least one required skill is needed"],
      default: [],
    },
    educationRequired: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    salary: {
      type: String,
      default: "Competitive",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Job", jobSchema);
