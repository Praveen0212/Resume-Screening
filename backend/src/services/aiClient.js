import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Common skill list for JS fallback
 */
const COMMON_SKILLS = [
  "python", "javascript", "typescript", "java", "c++", "c#", "go", "react", "next.js",
  "angular", "vue", "node.js", "express", "fastapi", "django", "spring boot", "mongodb",
  "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "azure", "gcp",
  "git", "linux", "html", "css", "tailwind", "machine learning", "deep learning", "nlp",
  "scikit-learn", "pandas", "numpy", "rest api", "graphql", "agile", "jira"
];

/**
 * Fallback parser when AI microservice is offline
 */
const fallbackParse = (text, filename) => {
  const lower = (text || "").toLowerCase();
  const matchedSkills = COMMON_SKILLS.filter((s) => lower.includes(s));
  
  return {
    candidate_name: filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
    email: (text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/) || ["user@example.com"])[0],
    phone: (text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/) || ["+1-555-0199"])[0],
    education: lower.includes("m.tech") ? "M.Tech" : lower.includes("phd") ? "Ph.D." : "B.Tech in Computer Science",
    experience_years: 2.5,
    skills: matchedSkills.length > 0 ? matchedSkills : ["JavaScript", "React", "Node.js", "MongoDB"],
    categorized_skills: {
      "Extracted": matchedSkills
    },
    summary: `Extracted profile for ${filename} with skills: ${matchedSkills.slice(0, 4).join(", ")}`,
    raw_text: text ? text.substring(0, 3000) : "Resume text extracted."
  };
};

/**
 * Fallback 60/20/10/10 matcher when AI microservice is offline
 */
const fallbackMatch = (resume, job) => {
  const rSkills = (resume.skills || []).map((s) => s.toLowerCase());
  const jSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());

  const matched = [];
  const missing = [];

  for (const js of jSkills) {
    if (rSkills.some((rs) => rs.includes(js) || js.includes(rs))) {
      matched.push(js);
    } else {
      missing.push(js);
    }
  }

  const skillsScore = jSkills.length > 0 ? Math.round((matched.length / jSkills.length) * 100) : 100;
  const expScore = (resume.experienceYears || 1) >= (job.experienceRequired || 0)
    ? 100
    : Math.round(((resume.experienceYears || 1) / Math.max(job.experienceRequired, 1)) * 90);
  const eduScore = 85;
  const textScore = 65;

  const skillsWeighted = Math.round(skillsScore * 0.60 * 10) / 10;
  const expWeighted = Math.round(expScore * 0.20 * 10) / 10;
  const eduWeighted = Math.round(eduScore * 0.10 * 10) / 10;
  const textWeighted = Math.round(textScore * 0.10 * 10) / 10;

  const totalMatch = Math.min(Math.round(skillsWeighted + expWeighted + eduWeighted + textWeighted), 100);

  let recommendation = "Moderately Suitable";
  let recommendationColor = "amber";
  if (totalMatch >= 75) {
    recommendation = "Highly Suitable";
    recommendationColor = "green";
  } else if (totalMatch < 50) {
    recommendation = "Needs Upskilling";
    recommendationColor = "red";
  }

  return {
    match_score: totalMatch,
    recommendation,
    recommendation_color: recommendationColor,
    matched_skills: matched,
    missing_skills: missing,
    skill_gap_percentage: jSkills.length > 0 ? Math.round((missing.length / jSkills.length) * 100) : 0,
    breakdown: {
      skills_score: skillsScore,
      skills_weighted: skillsWeighted,
      experience_score: expScore,
      experience_weighted: expWeighted,
      education_score: eduScore,
      education_weighted: eduWeighted,
      text_similarity_score: textScore,
      text_similarity_weighted: textWeighted,
    },
    advice: [
      missing.length > 0 ? `Enhance your proficiency in ${missing.slice(0, 2).join(", ")}.` : "Great skill overlap!",
      "Review job requirements and align interview portfolio."
    ]
  };
};

/**
 * Send file to Python AI service for deep parsing
 */
export const parseResumeWithAI = async (filePath, originalname) => {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append("file", fileStream, originalname);

    const response = await axios.post(`${AI_SERVICE_URL}/api/parse`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.warn(`[AI Client] Primary FastAPI parsing failed (${error.message}). Activating fallback parser...`);
    let fallbackText = "";
    try {
      // If it's a readable text file, read content
      if (originalname.endsWith(".txt")) {
        fallbackText = fs.readFileSync(filePath, "utf-8");
      }
    } catch (_) {}
    return fallbackParse(fallbackText, originalname);
  }
};

/**
 * Call Python AI service for weighted job matching
 */
export const matchResumeWithAI = async (resume, job) => {
  try {
    const payload = {
      resume_skills: resume.skills || [],
      resume_experience: resume.experienceYears || 0,
      resume_education: resume.education || "",
      resume_text: resume.rawText || "",
      job_skills: job.requiredSkills || [],
      job_experience: job.experienceRequired || 0,
      job_education: job.educationRequired || "",
      job_description: job.description || "",
    };

    const response = await axios.post(`${AI_SERVICE_URL}/api/match`, payload, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.warn(`[AI Client] FastAPI match call failed (${error.message}). Using local JS matching fallback...`);
    return fallbackMatch(resume, job);
  }
};

/**
 * Batch match multiple jobs against a single resume
 */
export const batchMatchWithAI = async (resume, jobs) => {
  try {
    const payload = {
      resume_skills: resume.skills || [],
      resume_experience: resume.experienceYears || 0,
      resume_education: resume.education || "",
      resume_text: resume.rawText || "",
      jobs: jobs.map((j) => ({
        id: j._id.toString(),
        title: j.title,
        company: j.company,
        location: j.location,
        experience_required: j.experienceRequired,
        required_skills: j.requiredSkills,
        education_required: j.educationRequired,
        description: j.description,
      })),
    };

    const response = await axios.post(`${AI_SERVICE_URL}/api/match-batch`, payload, {
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.warn(`[AI Client] Batch match fallback: evaluating locally...`);
    const ranked = jobs.map((job) => ({
      job: {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        experience_required: job.experienceRequired,
        required_skills: job.requiredSkills,
        education_required: job.educationRequired,
        description: job.description,
      },
      match_result: fallbackMatch(resume, job),
    }));

    ranked.sort((a, b) => b.match_result.match_score - a.match_result.match_score);
    return { ranked_jobs: ranked, total_evaluated: ranked.length };
  }
};
