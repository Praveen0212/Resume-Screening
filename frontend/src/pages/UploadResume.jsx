import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck,
} from "lucide-react";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedResult, setParsedResult] = useState(null);

  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Please upload a supported file format (.pdf, .docx, .doc, or .txt)");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await resumeAPI.uploadResume(formData);
      setParsedResult(response.data.resume);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload and parse resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "1rem auto 3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Upload & Screen Resume</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Our Python FastAPI microservice extracts candidate details, skills, and experience with NLP.
        </p>
      </div>

      {error && (
        <div
          className="badge badge-red"
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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!parsedResult ? (
        <div className="card">
          <form onSubmit={handleUpload}>
            <div
              className={`dropzone ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("resume-file-input").click()}
            >
              <input
                id="resume-file-input"
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
              />

              <div className="dropzone-icon">
                <UploadCloud size={32} />
              </div>

              {file ? (
                <div>
                  <h3 style={{ color: "var(--primary)", fontSize: "1.15rem", marginBottom: "0.25rem" }}>
                    {file.name}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {(file.size / 1024).toFixed(1)} KB • Ready for AI screening
                  </p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>
                    Choose a resume or drag & drop here
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                    Supports PDF, DOCX, DOC, and TXT files up to 10MB
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1.5rem",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                💡 Tip: Files with well-defined sections parse with maximum accuracy.
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!file || loading}
                style={{ minWidth: "180px" }}
              >
                {loading ? (
                  <>
                    <Sparkles size={16} className="animate-spin" /> Processing AI...
                  </>
                ) : (
                  <>
                    <FileCheck size={16} /> Parse Resume Now
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sample test files info */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
              textAlign: "left",
            }}
          >
            <h4 style={{ fontSize: "0.95rem", color: "var(--dark-navy)", marginBottom: "0.5rem" }}>
              Sample Resumes Available in Project:
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              You can test real uploads using the sample files generated in your{" "}
              <code>sample_data/</code> folder:
              <br />
              • <code>sample_data/sample_resume_fullstack.pdf</code> (Full Stack MERN candidate)
              <br />
              • <code>sample_data/sample_resume_frontend.pdf</code> (Frontend React candidate)
              <br />
              • <code>sample_data/sample_resume_ai_datascientist.docx</code> (Data Science & NLP candidate)
            </p>
          </div>
        </div>
      ) : (
        /* Parsed Result Success Card */
        <div className="card" style={{ border: "2px solid var(--success-border)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "var(--success-bg)",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
                margin: "0 auto 0.75rem",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--success)" }}>Resume Successfully Parsed!</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Extracted profile and skills taxonomy using our Python NLP service
            </p>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Candidate Name
                </span>
                <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{parsedResult.candidateName}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Education Detected
                </span>
                <p style={{ fontWeight: 600 }}>{parsedResult.education}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Contact Email
                </span>
                <p>{parsedResult.email || "N/A"}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Estimated Experience
                </span>
                <p style={{ fontWeight: 600 }}>
                  {parsedResult.experienceYears} {parsedResult.experienceYears === 1 ? "year" : "years"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Identified Skills ({parsedResult.skills?.length || 0})
              </span>
              <div className="skills-wrap" style={{ marginTop: "0.5rem" }}>
                {(parsedResult.skills || []).map((skill, idx) => (
                  <span key={idx} className="skill-pill matched">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              onClick={() => {
                setParsedResult(null);
                setFile(null);
              }}
              className="btn btn-secondary"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate(`/analysis/${parsedResult._id}`)}
              className="btn btn-primary"
            >
              <Layers size={16} /> View Deep Analysis & Job Matches <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
