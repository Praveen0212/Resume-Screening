import React from "react";
import { Cpu, Server, Database, Code, CheckCircle2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ fontWeight: 600, color: "var(--dark-navy)", marginBottom: "0.25rem" }}>
          AI-Based Resume Screening & Job Matching System
        </p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Weighted Scoring Formula: Skills (60%) • Experience (20%) • Education (10%) • TF-IDF Cosine Similarity (10%)
        </p>
        <div className="footer-tech">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Code size={14} color="#0052cc" /> React.js + Vite
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Server size={14} color="#059669" /> Node.js Express API
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Database size={14} color="#16a34a" /> MongoDB Mongoose
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Cpu size={14} color="#d97706" /> Python FastAPI NLP
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
