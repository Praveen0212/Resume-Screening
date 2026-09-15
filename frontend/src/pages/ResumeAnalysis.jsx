import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";
import {
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Download,
} from "lucide-react";

const ResumeAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await resumeAPI.getResumeById(id);
        setResume(res.data.resume);
      } catch (err) {
        setError("Failed to load resume details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResume();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await resumeAPI.deleteResume(id);
        navigate("/dashboard");
      } catch (err) {
        alert("Failed to delete resume: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Sparkles size={32} className="animate-spin" color="var(--primary)" />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
          Loading AI Resume Profile...
        </p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center" }}>
        <h2 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Error</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {error || "Resume not found."}
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Flatten categorized skills if available or group by taxonomy
  const categorized = resume.categorizedSkills || {};

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto 3rem" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.85rem" }}>{resume.candidateName}</h1>
            {resume.isPrimary && <span className="badge badge-green">Primary Active</span>}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "0.2rem" }}>
            Parsed from <b>{resume.filename}</b> • Uploaded on{" "}
            {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={`/jobs?resumeId=${resume._id}`} className="btn btn-primary">
            <Sparkles size={16} /> Match With Jobs <ArrowRight size={16} />
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <h3 className="card-title" style={{ marginBottom: "1rem" }}>
          Candidate Profile Overview
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0284c7",
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Education Degree
              </span>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{resume.education}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <Briefcase size={20} />
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Work Experience
              </span>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {resume.experienceYears} {resume.experienceYears === 1 ? "Year" : "Years"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "#f3e8ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9333ea",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Email
              </span>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{resume.email || "Not found"}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Phone
              </span>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{resume.phone || "Not found"}</p>
            </div>
          </div>
        </div>

        {resume.summary && (
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              AI Profile Summary:
            </span>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "0.25rem" }}>
              {resume.summary}
            </p>
          </div>
        )}
      </div>

      {/* Identified Skills Taxonomy */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <div className="card-header">
          <h3 className="card-title">Extracted Skills Taxonomy</h3>
          <span className="badge badge-blue">
            <CheckCircle2 size={14} /> {resume.skills?.length || 0} Total Skills Recognized
          </span>
        </div>

        {/* All skills pill cloud */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="skills-wrap">
            {(resume.skills || []).map((skill, idx) => (
              <span key={idx} className="skill-pill matched">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Categorized groups if present */}
        {Object.keys(categorized).length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            {Object.entries(categorized).map(([category, skillList], idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--dark-navy)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {category}
                </div>
                <div className="skills-wrap">
                  {skillList.map((s, sIdx) => (
                    <span key={sIdx} className="skill-pill neutral" style={{ fontSize: "0.78rem" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Extracted Text Viewer */}
      {resume.rawText && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "0.75rem" }}>
            Extracted Text Preview
          </h3>
          <pre
            style={{
              background: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              fontFamily: "monospace",
              fontSize: "0.82rem",
              color: "#334155",
              maxHeight: "240px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid var(--border)",
            }}
          >
            {resume.rawText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
