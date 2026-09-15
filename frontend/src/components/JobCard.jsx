import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock, Sparkles, ArrowRight, DollarSign } from "lucide-react";
import SkillBadge from "./SkillBadge";

const JobCard = ({ job, matchScore, recommendation }) => {
  return (
    <div className="job-card">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.2rem" }}>
              <Link to={`/jobs/${job._id || job.id}`} style={{ color: "var(--dark-navy)" }}>
                {job.title}
              </Link>
            </h3>
            <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.92rem" }}>
              {job.company}
            </p>
          </div>

          {matchScore !== undefined && (
            <div style={{ textAlign: "right" }}>
              <span
                className={`badge ${
                  matchScore >= 75 ? "badge-green" : matchScore >= 50 ? "badge-amber" : "badge-red"
                }`}
                style={{ fontSize: "0.85rem" }}
              >
                <Sparkles size={13} /> {Math.round(matchScore)}% Match
              </span>
              {recommendation && (
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {recommendation}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="job-meta-row">
          <span className="job-meta-item">
            <MapPin size={15} /> {job.location}
          </span>
          <span className="job-meta-item">
            <Briefcase size={15} /> {job.jobType || "Full-time"}
          </span>
          <span className="job-meta-item">
            <Clock size={15} /> {job.experienceRequired} {job.experienceRequired === 1 ? "yr" : "yrs"} exp
          </span>
          {job.salary && (
            <span className="job-meta-item">
              <DollarSign size={15} /> {job.salary}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.description}
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            REQUIRED SKILLS:
          </div>
          <div className="skills-wrap">
            {(job.requiredSkills || []).slice(0, 5).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} type="neutral" />
            ))}
            {(job.requiredSkills || []).length > 5 && (
              <span className="skill-pill neutral" style={{ fontSize: "0.78rem" }}>
                +{job.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link to={`/match/${job._id || job.id}`} className="btn btn-primary btn-sm">
          <Sparkles size={14} /> Check AI Match
        </Link>
        <Link to={`/jobs/${job._id || job.id}`} className="btn btn-secondary btn-sm">
          Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
