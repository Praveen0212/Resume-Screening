import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI, resumeAPI, matchAPI } from "../services/api";
import {
  User,
  FileText,
  Briefcase,
  CheckCircle2,
  Trash2,
  Upload,
  ArrowRight,
  Shield,
  Save,
  Star,
} from "lucide-react";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    title: user?.title || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [resumeRes, appRes] = await Promise.all([
        resumeAPI.getResumes(),
        matchAPI.getUserApplications(),
      ]);
      setResumes(resumeRes.data.resumes || []);
      setApplications(appRes.data.applications || []);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await authAPI.updateProfile(formData);
      updateUserProfile(res.data.user);
      setMessage("Profile details successfully updated!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await resumeAPI.setPrimaryResume(id);
      fetchUserData();
    } catch (err) {
      alert("Failed to set primary resume");
    }
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await resumeAPI.deleteResume(id);
        fetchUserData();
      } catch (err) {
        alert("Failed to delete resume");
      }
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>Candidate Profile & Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage your personal information, active resumes, and application tracking history.
        </p>
      </div>

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
          <CheckCircle2 size={18} /> <span>{message}</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
          Personal Details
        </h3>

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ""}
                disabled
                style={{ background: "#f1f5f9", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Full Stack Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Career Objective</label>
            <textarea
              className="form-textarea"
              placeholder="Write a brief professional summary..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Resumes Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">My Uploaded Resumes</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              The primary resume is automatically used for AI match rankings on your dashboard.
            </p>
          </div>
          <Link to="/upload" className="btn btn-secondary btn-sm">
            <Upload size={14} /> Upload New
          </Link>
        </div>

        {resumes.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Candidate</th>
                  <th>Skills Extracted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.filename}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{r.candidateName}</td>
                    <td>
                      <span className="badge badge-blue">{r.skills?.length || 0} skills</span>
                    </td>
                    <td>
                      {r.isPrimary ? (
                        <span className="badge badge-green">
                          <Star size={12} fill="currentColor" /> Primary Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(r._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Make Primary
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <Link to={`/analysis/${r._id}`} className="btn btn-secondary btn-sm">
                          Analysis
                        </Link>
                        <button
                          onClick={() => handleDeleteResume(r._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
            No resumes uploaded yet.
          </p>
        )}
      </div>

      {/* Applied Positions Tracker */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Submitted Job Applications</h3>
          <span className="badge badge-gray">{applications.length} Active</span>
        </div>

        {applications.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/jobs/${app.job?._id}`}>{app.job?.title || "Job Position"}</Link>
                    </td>
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
        ) : (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
            You have not submitted any applications yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
