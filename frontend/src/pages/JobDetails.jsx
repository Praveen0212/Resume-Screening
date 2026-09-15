import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobAPI, matchAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SkillBadge from "../components/SkillBadge";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Building,
  Send,
} from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobAPI.getJobById(id);
        setJob(res.data.job);
      } catch (err) {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setApplying(true);
    setError("");
    setMessage("");

    try {
      await matchAPI.applyForJob({ jobId: id });
      setHasApplied(true);
      setMessage("Application submitted successfully with AI match snapshot!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit application. Ensure you have an active resume uploaded."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Sparkles size={32} className="animate-spin" color="var(--primary)" />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center" }}>
        <h2 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Job Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
        <Link to="/jobs" className="btn btn-primary">
          Back to All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto 3rem" }}>
      <Link
        to="/jobs"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "1.25rem",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to Job Listings
      </Link>

      {message && (
        <div
          className="badge badge-green"
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          className="badge badge-red"
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius-md)",
          }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <span className="badge badge-blue" style={{ marginBottom: "0.5rem" }}>
              {job.jobType || "Full-time"}
            </span>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>{job.title}</h1>
            <p style={{ fontSize: "1.1rem", color: "var(--primary)", fontWeight: 600 }}>
              {job.company}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to={`/match/${job._id}`} className="btn btn-outline">
              <Sparkles size={16} /> View AI Match Score
            </Link>
            <button
              onClick={handleApply}
              disabled={hasApplied || applying}
              className="btn btn-primary"
            >
              {hasApplied ? (
                <>
                  <CheckCircle2 size={16} /> Applied
                </>
              ) : applying ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={16} /> Apply Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            padding: "1.25rem",
            background: "#f8fafc",
            borderRadius: "var(--radius-md)",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <MapPin size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Location
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{job.location}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Clock size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Experience Required
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                {job.experienceRequired} {job.experienceRequired === 1 ? "Year" : "Years"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <DollarSign size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Compensation
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{job.salary || "Competitive"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <GraduationCap size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Education Requirement
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                {job.educationRequired || "Bachelor's Degree"}
              </div>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>Target Skills & Keywords</h3>
          <div className="skills-wrap">
            {(job.requiredSkills || []).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} type="neutral" />
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>Role Overview & Responsibilities</h3>
          <div
            style={{
              lineHeight: 1.75,
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              whiteSpace: "pre-line",
            }}
          >
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
