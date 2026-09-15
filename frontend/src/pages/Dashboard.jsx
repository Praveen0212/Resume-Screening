import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resumeAPI, matchAPI } from "../services/api";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import MatchGauge from "../components/MatchGauge";
import SkillBadge from "../components/SkillBadge";
import {
  FileText,
  Briefcase,
  TrendingUp,
  Award,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [primaryResume, setPrimaryResume] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user resumes
        const resumeRes = await resumeAPI.getResumes();
        const userResumes = resumeRes.data.resumes || [];
        setResumes(userResumes);

        const primary = userResumes.find((r) => r.isPrimary) || userResumes[0] || null;
        setPrimaryResume(primary);

        // 2. Fetch job recommendations ranked by AI
        if (primary) {
          const matchRes = await matchAPI.getRecommendations();
          setRecommendations(matchRes.data.ranked_jobs || []);
        }

        // 3. Fetch recent applications
        const appRes = await matchAPI.getUserApplications();
        setApplications(appRes.data.applications || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const highestMatch =
    recommendations.length > 0 ? Math.round(recommendations[0].match_result.match_score) : 0;

  // Aggregate top matched & missing skills across recommendations
  const topMatchedSkills = Array.from(
    new Set(
      recommendations.flatMap((r) => r.match_result.matched_skills || []).slice(0, 8)
    )
  );
  const topMissingSkills = Array.from(
    new Set(
      recommendations.flatMap((r) => r.match_result.missing_skills || []).slice(0, 8)
    )
  );

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #091e42 0%, #0052cc 100%)",
          color: "white",
          marginBottom: "2rem",
          padding: "2.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255, 255, 255, 0.15)",
              padding: "0.3rem 0.8rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={14} /> AI Powered Candidate Portal
          </div>
          <h1 style={{ color: "white", fontSize: "1.85rem", marginBottom: "0.4rem" }}>
            Welcome back, {user?.name || "Candidate"}!
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "0.95rem", maxWidth: "600px" }}>
            {primaryResume
              ? `Active Resume: ${primaryResume.filename} • ${primaryResume.skills?.length || 0} skills identified`
              : "Upload your resume in PDF or DOCX to unlock real-time 60/20/10/10 AI job matching."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/upload" className="btn btn-secondary" style={{ color: "var(--primary)" }}>
            <Upload size={16} /> Upload Resume
          </Link>
          {primaryResume && (
            <Link
              to={`/analysis/${primaryResume._id}`}
              className="btn"
              style={{ background: "rgba(255, 255, 255, 0.2)", color: "white" }}
            >
              <FileText size={16} /> View Analysis
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard
          icon={FileText}
          title="Resumes Uploaded"
          value={resumes.length}
          color="blue"
          subtitle={primaryResume ? "1 active primary" : "No active resume"}
        />
        <StatCard
          icon={Briefcase}
          title="AI Recommended Jobs"
          value={recommendations.length}
          color="green"
          subtitle="Ranked by suitability"
        />
        <StatCard
          icon={Award}
          title="Highest Match Score"
          value={`${highestMatch}%`}
          color="purple"
          subtitle={highestMatch >= 75 ? "Highly Suitable match" : "Good potential"}
        />
        <StatCard
          icon={TrendingUp}
          title="Applications Sent"
          value={applications.length}
          color="amber"
          subtitle="Active submissions"
        />
      </div>

      {/* Primary Insights Split View */}
      {primaryResume ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Top Recommendation Gauge */}
          {recommendations.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Top Match Benchmark</h3>
                <span className="badge badge-blue">Weighted 60/20/10/10</span>
              </div>
              <MatchGauge
                score={recommendations[0].match_result.match_score}
                recommendation={recommendations[0].match_result.recommendation}
                subtitle={`Aligned with "${recommendations[0].job.title}"`}
              />
              <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
                <Link
                  to={`/match/${recommendations[0].job.id || recommendations[0].job._id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Full Breakdown & Apply <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Skill Overlap & Gap Highlights */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Skill Profile Insights</h3>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                From your primary resume
              </span>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--success)",
                  marginBottom: "0.6rem",
                }}
              >
                <CheckCircle2 size={16} /> Matched In-Demand Skills ({topMatchedSkills.length})
              </div>
              <div className="skills-wrap">
                {topMatchedSkills.length > 0 ? (
                  topMatchedSkills.map((s, idx) => <SkillBadge key={idx} skill={s} type="matched" />)
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Evaluating recommendations...
                  </span>
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--warning)",
                  marginBottom: "0.6rem",
                }}
              >
                <AlertTriangle size={16} /> Key Missing Skills to Upskill ({topMissingSkills.length})
              </div>
              <div className="skills-wrap">
                {topMissingSkills.length > 0 ? (
                  topMissingSkills.map((s, idx) => <SkillBadge key={idx} skill={s} type="missing" />)
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    No missing skills detected!
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "0.85rem",
                background: "var(--primary-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--dark-navy)",
              }}
            >
              💡 <b>Viva Tip:</b> The 60% skills weighting calculates set overlap and keyword density, while 20% experience checks year parity, 10% ranks degree eligibility, and 10% runs Scikit-learn TF-IDF cosine similarity.
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{ textAlign: "center", padding: "3rem 1.5rem", marginBottom: "2.5rem" }}
        >
          <div className="dropzone-icon" style={{ background: "var(--primary-light)" }}>
            <Upload size={28} color="var(--primary)" />
          </div>
          <h2 style={{ marginBottom: "0.5rem" }}>No Resume Uploaded Yet</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            Upload your resume in PDF or DOCX format to let our Python NLP microservice parse your credentials and match you with open jobs.
          </p>
          <Link to="/upload" className="btn btn-primary">
            <Upload size={16} /> Upload Your Resume Now
          </Link>
        </div>
      )}

      {/* Recommended Jobs List */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.45rem" }}>Top AI-Ranked Job Matches</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Jobs ordered by total weighted suitability score
            </p>
          </div>
          <Link to="/jobs" className="btn btn-secondary btn-sm">
            View All Jobs <ArrowRight size={14} />
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {recommendations.slice(0, 4).map((rec, idx) => (
              <JobCard
                key={idx}
                job={rec.job}
                matchScore={rec.match_result.match_score}
                recommendation={rec.match_result.recommendation}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--text-muted)" }}>
              {primaryResume
                ? "No jobs available for ranking at the moment."
                : "Upload a resume to view AI-ranked recommendations."}
            </p>
          </div>
        )}
      </div>

      {/* Recent Applications Table */}
      {applications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Job Applications</h3>
            <span className="badge badge-gray">{applications.length} Submissions</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Recommendation</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600 }}>{app.job?.title || "Position"}</td>
                    <td>{app.job?.company || "Company"}</td>
                    <td>
                      <span
                        className={`badge ${
                          app.matchScore >= 75
                            ? "badge-green"
                            : app.matchScore >= 50
                            ? "badge-amber"
                            : "badge-red"
                        }`}
                      >
                        {Math.round(app.matchScore)}%
                      </span>
                    </td>
                    <td>{app.recommendation}</td>
                    <td>
                      <span className="badge badge-blue">{app.status}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
