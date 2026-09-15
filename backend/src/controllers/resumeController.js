import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";
import { parseResumeWithAI } from "../services/aiClient.js";

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a resume file (PDF/DOCX/TXT)." });
    }

    const { originalname, path: filePath, size } = req.file;

    // Send file to Python AI parsing service
    const parsedData = await parseResumeWithAI(filePath, originalname);

    // Unset primary on existing resumes for this user
    await Resume.updateMany({ user: req.user._id }, { isPrimary: false });

    // Create new resume entry
    const resume = await Resume.create({
      user: req.user._id,
      filename: originalname,
      filePath: filePath,
      fileSize: size,
      candidateName: parsedData.candidate_name || req.user.name,
      email: parsedData.email || req.user.email,
      phone: parsedData.phone || req.user.phone || "",
      education: parsedData.education || "Bachelor's Degree",
      experienceYears: parsedData.experience_years || 0,
      skills: parsedData.skills || [],
      categorizedSkills: parsedData.categorized_skills || {},
      summary: parsedData.summary || "",
      rawText: parsedData.raw_text || "",
      isPrimary: true,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully by AI service!",
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Check ownership unless admin
    if (resume.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this resume" });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    if (resume.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this resume" });
    }

    // Attempt to delete physical file from disk
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (err) {
        console.warn("Could not remove file from disk:", err.message);
      }
    }

    await resume.deleteOne();

    // If this was primary, set another one as primary
    if (resume.isPrimary) {
      const remaining = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isPrimary = true;
        await remaining.save();
      }
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
    resume.isPrimary = true;
    await resume.save();

    res.json({
      success: true,
      message: "Primary resume updated successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};
