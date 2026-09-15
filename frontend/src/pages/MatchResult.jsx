import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { matchAPI, resumeAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MatchGauge from "../components/MatchGauge";
import SkillBadge from "../components/SkillBadge";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Info,
} from "lucide-react";

const MatchResult = () => {
  const { jobId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("primary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch user resumes for selection dropdown
        const rRes = await resumeAPI.getResumes();
        const userResumes = rRes.data.resumes || [];
        setResumes(userResumes);

        // Run match evaluation
        const res = await matchAPI.evaluateMatch(selectedResumeId, jobId);
        setMatchData(res.data);
        setApplied(res.data.hasApplied);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Evaluation failed. Please make sure you have uploaded at least one resume."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobId, selectedResumeId, isAuthenticated]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await matchAPI.applyForJob({
        jobId,
        resumeId: matchData?.resume?.id,
      });
      setApplied(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Sparkles size={36} className="animate-spin" color="var(--primary)" />
        <h3 style={{ marginTop: "1rem" }}>Evaluating NLP Match Score...</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Applying 60% skills, 20% experience, 10% education, and 10% TF-IDF similarity formula
        </p>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center" }}>
        <h2 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Evaluation Notice</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {error || "Could not evaluate match."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link to="/upload" className="btn btn-primary">
            Upload a Resume
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const { resume, job, matchResult } = matchData;
  const breakdown = matchResult.breakdown;

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto 3rem" }}>
      {/* Back Link */}
      <Link
        to={`/jobs/${job.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "1.25rem",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to Job Details
      </Link>

      {/* Top Header Card */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%)",
        }}
      >
        <div>
          <span className="badge badge-blue" style={{ marginBottom: "0.5rem" }}>
            AI Match Evaluation Report
          </span>
          <h1 style={{ fontSize: "1.85rem", marginBottom: "0.25rem" }}>{job.title}</h1>
          <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "1.05rem" }}>
            {job.company} • {job.location}
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Evaluating against Candidate: <b>{resume.candidateName}</b> ({resume.filename})
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "220px" }}>
          {resumes.length > 1 && (
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>
                SELECT RESUME:
              </label>
              <select
                className="form-select"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", marginTop: "0.2rem" }}
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                <option value="primary">Primary Active Resume</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.filename}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={applied || applying}
            className="btn btn-primary btn-lg"
          >
            {applied ? (
              <>
                <CheckCircle2 size={18} /> Already Applied
              </>
            ) : applying ? (
              "Submitting..."
            ) : (
              <>
                <Send size={18} /> Apply for Position
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        {/* Score Gauge Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <MatchGauge
            score={matchResult.match_score}
            recommendation={matchResult.recommendation}
            subtitle="Weighted College-Viva Standard Matching"
          />

          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f8fafc",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--dark-navy)", marginBottom: "0.25rem" }}>
              Mathematical Scoring Breakdown:
            </div>
            <div>• Skills (60% weight): <b>{breakdown.skills_weighted} pts</b> / 60</div>
            <div>• Experience (20% weight): <b>{breakdown.experience_weighted} pts</b> / 20</div>
            <div>• Education (10% weight): <b>{breakdown.education_weighted} pts</b> / 10</div>
            <div>• TF-IDF Similarity (10% weight): <b>{breakdown.text_similarity_weighted} pts</b> / 10</div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.4rem", paddingTop: "0.4rem", fontWeight: 700 }}>
              Total Calculated Score: {matchResult.match_score}%
            </div>
          </div>
        </div>

        {/* 4 Pillars Progress Cards */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
            4-Pillar Weighted Score Diagnostics
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* 1. Skills */}
            <div className="pillar-card">
              <div className="pillar-header">
                <span>1. Skills Relevance (60% Weight)</span>
                <span style={{ color: "var(--primary)" }}>{breakdown.skills_score}% raw</span>
              </div>
              <div className="pillar-score">{breakdown.skills_weighted} / 60 pts</div>
              <div className="pillar-bar-bg">
                <div
                  className="pillar-bar-fill"
                  style={{ width: `${(breakdown.skills_weighted / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Experience */}
            <div className="pillar-card">
              <div className="pillar-header">
                <span>2. Experience Parity (20% Weight)</span>
                <span style={{ color: "var(--primary)" }}>{breakdown.experience_score}% raw</span>
              </div>
              <div className="pillar-score">{breakdown.experience_weighted} / 20 pts</div>
              <div className="pillar-bar-bg">
                <div
                  className="pillar-bar-fill"
                  style={{
                    width: `${(breakdown.experience_weighted / 20) * 100}%`,
                    background: "#0284c7",
                  }}
                />
              </div>
            </div>

            {/* 3. Education */}
            <div className="pillar-card">
              <div className="pillar-header">
                <span>3. Education Compatibility (10% Weight)</span>
                <span style={{ color: "var(--primary)" }}>{breakdown.education_score}% raw</span>
              </div>
              <div className="pillar-score">{breakdown.education_weighted} / 10 pts</div>
              <div className="pillar-bar-bg">
                <div
                  className="pillar-bar-fill"
                  style={{
                    width: `${(breakdown.education_weighted / 10) * 100}%`,
                    background: "#9333ea",
                  }}
                />
              </div>
            </div>

            {/* 4. TF-IDF */}
            <div className="pillar-card">
              <div className="pillar-header">
                <span>4. NLP TF-IDF Cosine Match (10% Weight)</span>
                <span style={{ color: "var(--primary)" }}>{breakdown.text_similarity_score}% raw</span>
              </div>
              <div className="pillar-score">{breakdown.text_similarity_weighted} / 10 pts</div>
              <div className="pillar-bar-bg">
                <div
                  className="pillar-bar-fill"
                  style={{
                    width: `${(breakdown.text_similarity_weighted / 10) * 100}%`,
                    background: "#d97706",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched vs Missing Skills Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        {/* Matched Skills */}
        <div className="card" style={{ borderTop: "4px solid var(--success)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <CheckCircle2 color="var(--success)" size={22} />
            <h3 style={{ fontSize: "1.15rem" }}>
              Matched Skills ({matchResult.matched_skills.length})
            </h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            Skills found in both your resume and the job listing requirements:
          </p>
          <div className="skills-wrap">
            {matchResult.matched_skills.length > 0 ? (
              matchResult.matched_skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} type="matched" />
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No direct overlapping skills detected.
              </p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card" style={{ borderTop: "4px solid var(--warning)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <AlertTriangle color="var(--warning)" size={22} />
            <h3 style={{ fontSize: "1.15rem" }}>
              Missing Skills Gap ({matchResult.missing_skills.length})
            </h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            Required skills missing from your resume ({matchResult.skill_gap_percentage}% gap):
          </p>
          <div className="skills-wrap">
            {matchResult.missing_skills.length > 0 ? (
              matchResult.missing_skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} type="missing" />
              ))
            ) : (
              <p style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.9rem" }}>
                🎉 Perfect match! You possess 100% of the required skills.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations & Actionable Advice */}
      <div className="card" style={{ background: "#ffffff", borderLeft: "5px solid var(--primary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <Sparkles color="var(--primary)" size={22} />
          <h3 style={{ fontSize: "1.2rem" }}>AI Career Recommendations & Roadmap</h3>
        </div>

        <ul style={{ paddingLeft: "1.25rem", color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.7 }}>
          {(matchResult.advice || []).map((tip, idx) => (
            <li key={idx} style={{ marginBottom: "0.4rem" }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MatchResult;
