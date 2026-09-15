import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import Application from "../models/Application.js";
import { connectDB, closeDB } from "../config/db.js";

dotenv.config();

const sampleJobs = [
  {
    title: "Full Stack MERN Developer",
    company: "TechNova Solutions",
    location: "Bangalore, India (Hybrid)",
    jobType: "Full-time",
    experienceRequired: 2,
    requiredSkills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "REST API", "Git"],
    educationRequired: "B.Tech / B.E. / BCA / MCA in Computer Science",
    description: "We are seeking a talented Full Stack Developer proficient in the MERN stack. You will design, develop, and maintain responsive web applications, implement RESTful microservices, and collaborate closely with product design teams.",
    salary: "₹8,00,000 - ₹12,00,000 / year",
  },
  {
    title: "Python AI & FastAPI Backend Engineer",
    company: "NeuralPulse Labs",
    location: "Hyderabad, India (Remote)",
    jobType: "Full-time",
    experienceRequired: 3,
    requiredSkills: ["Python", "FastAPI", "Machine Learning", "Scikit-learn", "Docker", "MongoDB", "PyTorch"],
    educationRequired: "B.Tech / M.Tech / M.S. in Computer Science or Data Science",
    description: "Join our core AI engineering team building high-performance NLP models and automated document processing pipelines. Experience deploying scalable FastAPI microservices and scikit-learn models using Docker is essential.",
    salary: "₹12,00,000 - ₹16,00,000 / year",
  },
  {
    title: "Frontend React Developer",
    company: "CloudSpark Systems",
    location: "Pune, India (Hybrid)",
    jobType: "Full-time",
    experienceRequired: 1.5,
    requiredSkills: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind", "Vite", "Redux", "Responsive Design"],
    educationRequired: "Bachelor's Degree in CS, IT or equivalent",
    description: "Craft pixel-perfect, accessible user interfaces using React, modern CSS, and Vite. You will work on interactive dashboards, state management with Redux, and user-centric web applications.",
    salary: "₹6,50,000 - ₹9,50,000 / year",
  },
  {
    title: "DevOps & Cloud Infrastructure Engineer",
    company: "Apex Cloud Services",
    location: "Chennai, India (Hybrid)",
    jobType: "Full-time",
    experienceRequired: 3,
    requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Git"],
    educationRequired: "B.Tech / B.E. in Engineering or equivalent practical experience",
    description: "Design and maintain resilient cloud infrastructure on AWS. Automate CI/CD deployment pipelines, manage containerized clusters with Kubernetes, and maintain infrastructure as code.",
    salary: "₹11,00,000 - ₹15,00,000 / year",
  },
  {
    title: "Junior Java & Spring Boot Developer",
    company: "FinTech Vantage",
    location: "Mumbai, India (On-site)",
    jobType: "Full-time",
    experienceRequired: 1,
    requiredSkills: ["Java", "Spring Boot", "SQL", "MySQL", "Microservices", "Git", "REST API"],
    educationRequired: "B.Tech / B.E. in CS / IT",
    description: "Looking for an energetic Junior Java Developer to join our core banking transactions team. You will write clean, well-tested Spring Boot code and interact with high-volume SQL databases.",
    salary: "₹5,50,000 - ₹7,50,000 / year",
  },
  {
    title: "Data Science & NLP Analyst",
    company: "Cognitive Insights",
    location: "Gurgaon, India (Hybrid)",
    jobType: "Full-time",
    experienceRequired: 2,
    requiredSkills: ["Python", "NLP", "Scikit-learn", "Pandas", "NumPy", "Data Analysis", "SQL"],
    educationRequired: "Bachelor's or Master's in CS / Data Science / Statistics",
    description: "Extract actionable insights from unstructured textual datasets. Work with TF-IDF, text embeddings, sentiment classifiers, and feature engineering pipelines.",
    salary: "₹9,00,000 - ₹13,00,000 / year",
  },
  {
    title: "Junior Software Engineer (Fresher / 2025/2026 Batch)",
    company: "Global Logic Innovations",
    location: "Bangalore, India (On-site)",
    jobType: "Full-time",
    experienceRequired: 0,
    requiredSkills: ["Python", "JavaScript", "HTML", "CSS", "SQL", "Git", "Problem Solving"],
    educationRequired: "B.Tech / B.E. / BCA / B.Sc in Computer Science",
    description: "Great opportunity for fresh graduates with strong problem-solving skills, basic familiarity with Python or JavaScript, and eagerness to learn modern full-stack web architectures.",
    salary: "₹4,50,000 - ₹6,00,000 / year",
  },
  {
    title: "Backend Node.js API Specialist",
    company: "Streamline Media",
    location: "Remote",
    jobType: "Remote",
    experienceRequired: 2.5,
    requiredSkills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "Docker", "REST API"],
    educationRequired: "Bachelor's Degree in Computer Science or related field",
    description: "Lead backend architecture for high-throughput streaming services. Scale MongoDB queries, implement caching with Redis, and integrate secure JWT auth and role-based policies.",
    salary: "₹10,00,000 - ₹14,00,000 / year",
  },
];

export const seedDatabase = async (closeOnFinish = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log("[Seed] Clearing old collections...");
    await User.deleteMany({});
    await Job.deleteMany({});
    await Resume.deleteMany({});
    await Application.deleteMany({});

    console.log("[Seed] Creating Admin & Student accounts...");
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@resumematch.com",
      password: "admin123",
      role: "admin",
      title: "Lead Technical Recruiter & Admin",
      phone: "+91 98765 43210",
      bio: "Managing technical hiring pipelines and AI job evaluation rules.",
    });

    const studentUser = await User.create({
      name: "Praveen Kumar",
      email: "student@example.com",
      password: "student123",
      role: "user",
      title: "Aspiring Full Stack Engineer",
      phone: "+91 91234 56789",
      bio: "Passionate computer science graduate specializing in React, Node.js, Python, and cloud services.",
    });

    console.log("[Seed] Inserting job postings...");
    const jobsWithAdmin = sampleJobs.map((j) => ({
      ...j,
      createdBy: adminUser._id,
    }));
    const createdJobs = await Job.insertMany(jobsWithAdmin);
    console.log(`[Seed] Successfully inserted ${createdJobs.length} realistic jobs.`);

    console.log("[Seed] Creating default active resume for student user...");
    const defaultResume = await Resume.create({
      user: studentUser._id,
      filename: "Praveen_Kumar_FullStack_Resume.pdf",
      filePath: "uploads/sample_praveen_resume.pdf",
      fileSize: 104857,
      candidateName: "Praveen Kumar",
      email: "student@example.com",
      phone: "+91 91234 56789",
      education: "B.Tech in Computer Science and Engineering",
      experienceYears: 2,
      skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "Python", "FastAPI", "Git", "REST API", "HTML5", "CSS3", "Docker"],
      categorizedSkills: {
        "Programming Languages": ["JavaScript", "Python"],
        "Frontend Frameworks & Web": ["React", "HTML5", "CSS3", "REST API"],
        "Backend & APIs": ["Node.js", "Express", "FastAPI"],
        "Databases & Caching": ["MongoDB"],
        "Cloud & DevOps": ["Git", "Docker"]
      },
      summary: "Full-stack developer with hands-on expertise building scalable web applications with React, Express, MongoDB, and Python FastAPI.",
      rawText: "Praveen Kumar. B.Tech Computer Science. Skills: React, Node.js, Express, MongoDB, JavaScript, Python, FastAPI, Git, REST API, HTML5, CSS3, Docker. 2 years experience building modern web applications.",
      isPrimary: true,
    });

    console.log("[Seed] Creating initial application...");
    await Application.create({
      user: studentUser._id,
      job: createdJobs[0]._id, // Full Stack MERN Developer
      resume: defaultResume._id,
      matchScore: 88.5,
      recommendation: "Highly Suitable",
      matchedSkills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "REST API", "Git"],
      missingSkills: [],
      skillGapPercentage: 0.0,
      breakdown: {
        skillsScore: 100,
        skillsWeighted: 60.0,
        experienceScore: 100,
        experienceWeighted: 20.0,
        educationScore: 90,
        educationWeighted: 9.0,
        textSimilarityScore: 80,
        textSimilarityWeighted: 8.0,
      },
      status: "Shortlisted",
    });

    console.log("\n=======================================================");
    console.log("  DATABASE SEEDED SUCCESSFULLY!");
    console.log("  Admin Login:   admin@resumematch.com / admin123");
    console.log("  Student Login: student@example.com / student123");
    console.log(`  Sample Jobs:   ${createdJobs.length} available`);
    console.log("=======================================================\n");

    if (closeOnFinish) {
      await closeDB();
    }
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    if (closeOnFinish) process.exit(1);
  }
};

// Auto-run if executed directly
if (process.argv[1].endsWith("seedData.js")) {
  seedDatabase();
}
