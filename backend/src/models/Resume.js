import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    candidateName: {
      type: String,
      default: "Candidate",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "Bachelor's Degree",
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    categorizedSkills: {
      type: Map,
      of: [String],
      default: {},
    },
    summary: {
      type: String,
      default: "",
    },
    rawText: {
      type: String,
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);
