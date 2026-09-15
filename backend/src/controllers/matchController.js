import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { matchResumeWithAI, batchMatchWithAI } from "../services/aiClient.js";

export const matchSingleJob = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.params;

    let resume;
    if (resumeId && resumeId !== "primary") {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true });
      if (!resume) {
        resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      }
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload a resume first to run AI matching.",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const matchResult = await matchResumeWithAI(resume, job);

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      user: req.user._id,
      job: job._id,
    });

    res.json({
      success: true,
      resume: {
        id: resume._id,
        filename: resume.filename,
        candidateName: resume.candidateName,
        skills: resume.skills,
        experienceYears: resume.experienceYears,
        education: resume.education,
      },
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        experienceRequired: job.experienceRequired,
        requiredSkills: job.requiredSkills,
        educationRequired: job.educationRequired,
      },
      matchResult,
      hasApplied: !!existingApplication,
      applicationStatus: existingApplication ? existingApplication.status : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobs = async (req, res, next) => {
  try {
    const { resumeId, minMatch = 0 } = req.query;

    let resume;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true });
      if (!resume) {
        resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      }
    }

    if (!resume) {
      return res.status(200).json({
        success: true,
        message: "No resume uploaded yet",
        hasResume: false,
        ranked_jobs: [],
      });
    }

    const jobs = await Job.find({ isActive: true });
    if (jobs.length === 0) {
      return res.json({
        success: true,
        hasResume: true,
        ranked_jobs: [],
      });
    }

    const batchResult = await batchMatchWithAI(resume, jobs);

    // Filter by minMatch if provided
    let ranked = batchResult.ranked_jobs;
    if (Number(minMatch) > 0) {
      ranked = ranked.filter((item) => item.match_result.match_score >= Number(minMatch));
    }

    res.json({
      success: true,
      hasResume: true,
      resume: {
        id: resume._id,
        filename: resume.filename,
        candidateName: resume.candidateName,
        skills: resume.skills,
      },
      ranked_jobs: ranked,
      total: ranked.length,
    });
  } catch (error) {
    next(error);
  }
};

export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, resumeId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    let resume;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true });
    }

    if (!resume) {
      return res.status(400).json({ success: false, message: "Please select or upload a resume to apply." });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({ user: req.user._id, job: jobId });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "You have already applied for this position." });
    }

    // Calculate match result
    const match = await matchResumeWithAI(resume, job);

    const application = await Application.create({
      user: req.user._id,
      job: job._id,
      resume: resume._id,
      matchScore: match.match_score,
      recommendation: match.recommendation,
      matchedSkills: match.matched_skills,
      missingSkills: match.missing_skills,
      skillGapPercentage: match.skill_gap_percentage,
      breakdown: {
        skillsScore: match.breakdown.skills_score,
        skillsWeighted: match.breakdown.skills_weighted,
        experienceScore: match.breakdown.experience_score,
        experienceWeighted: match.breakdown.experience_weighted,
        educationScore: match.breakdown.education_score,
        educationWeighted: match.breakdown.education_weighted,
        textSimilarityScore: match.breakdown.text_similarity_score,
        textSimilarityWeighted: match.breakdown.text_similarity_weighted,
      },
      status: "Applied",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully with AI match evaluation!",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate("job")
      .populate("resume", "filename candidateName skills")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};
