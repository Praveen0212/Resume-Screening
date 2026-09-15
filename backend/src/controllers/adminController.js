import User from "../models/User.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import Application from "../models/Application.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalApplications = await Application.countDocuments();

    const applications = await Application.find();
    let avgScore = 0;
    let highMatches = 0; // >= 75
    let moderateMatches = 0; // 50-74
    let lowMatches = 0; // < 50

    if (applications.length > 0) {
      const sum = applications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0);
      avgScore = Math.round((sum / applications.length) * 10) / 10;

      applications.forEach((app) => {
        if (app.matchScore >= 75) highMatches++;
        else if (app.matchScore >= 50) moderateMatches++;
        else lowMatches++;
      });
    }

    const recentApplications = await Application.find()
      .populate("user", "name email")
      .populate("job", "title company")
      .sort({ createdAt: -1 })
      .limit(6);

    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalResumes,
        totalApplications,
        avgMatchScore: avgScore,
        matchDistribution: {
          highMatches,
          moderateMatches,
          lowMatches,
        },
      },
      recentApplications,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent demoting last admin
    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: "Cannot demote the only administrator." });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: "Cannot delete the only administrator." });
      }
    }

    // Delete associated resumes and applications
    await Resume.deleteMany({ user: user._id });
    await Application.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({
      success: true,
      message: "User and associated candidate records deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("user", "name email title")
      .populate("job", "title company location requiredSkills")
      .populate("resume", "filename education experienceYears skills")
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

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Applied", "Under Review", "Shortlisted", "Interviewing", "Rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
