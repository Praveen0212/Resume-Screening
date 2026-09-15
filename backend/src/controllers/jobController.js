import Job from "../models/Job.js";

export const getJobs = async (req, res, next) => {
  try {
    const { search, skill, location, jobType, maxExp } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (skill) {
      query.requiredSkills = { $regex: skill, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    if (maxExp) {
      query.experienceRequired = { $lte: Number(maxExp) };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      experienceRequired,
      requiredSkills,
      educationRequired,
      description,
      salary,
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ success: false, message: "Please fill in all mandatory job fields." });
    }

    // Ensure requiredSkills is array
    let skillsArray = requiredSkills;
    if (typeof requiredSkills === "string") {
      skillsArray = requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const job = await Job.create({
      title,
      company,
      location,
      jobType: jobType || "Full-time",
      experienceRequired: Number(experienceRequired) || 0,
      requiredSkills: skillsArray || [],
      educationRequired: educationRequired || "Bachelor's Degree in Computer Science or related field",
      description,
      salary: salary || "Competitive",
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Job posting created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (req.body.requiredSkills && typeof req.body.requiredSkills === "string") {
      req.body.requiredSkills = req.body.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Job posting updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
