import React, { useState, useEffect } from "react";
import { adminAPI, jobAPI } from "../services/api";
import StatCard from "../components/StatCard";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, jobs, users, applications
  const [loading, setLoading] = useState(true);

  // Job Form Modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    experienceRequired: 1,
    requiredSkills: "",
    educationRequired: "Bachelor's Degree in Computer Science or related field",
    description: "",
    salary: "",
  });

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes, appsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        jobAPI.getJobs({}),
        adminAPI.getApplications(),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data.applications);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        await jobAPI.updateJob(editingJobId, jobForm);
      } else {
        await jobAPI.createJob(jobForm);
      }
      setShowJobModal(false);
      resetJobForm();
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to save job: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditJob = (job) => {
    setEditingJobId(job._id);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      experienceRequired: job.experienceRequired,
      requiredSkills: (job.requiredSkills || []).join(", "),
      educationRequired: job.educationRequired || "",
      description: job.description,
      salary: job.salary || "",
    });
    setShowJobModal(true);
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setJobForm({
      title: "",
      company: "",
      location: "",
      jobType: "Full-time",
      experienceRequired: 1,
      requiredSkills: "",
      educationRequired: "Bachelor's Degree in Computer Science or related field",
      description: "",
      salary: "",
    });
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await jobAPI.deleteJob(id);
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete job");
      }
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user and their records?")) {
      try {
        await adminAPI.deleteUser(userId);
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await adminAPI.updateApplicationStatus(appId, newStatus);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to update application status");
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading Admin Control Console...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto 3rem" }}>
      {/* Header */}
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
            <Shield size={16} /> Administrator Management Suite
          </div>
          <h1 style={{ fontSize: "2rem", marginTop: "0.2rem" }}>System Analytics & Operations</h1>
        </div>

        <button
          onClick={() => {
            resetJobForm();
            setShowJobModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Admin Stat Cards */}
      <div className="stat-grid">
        <StatCard
          icon={Users}
          title="Registered Users"
          value={stats?.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={Briefcase}
          title="Active Job Listings"
          value={stats?.totalJobs || 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          title="Parsed Resumes"
          value={stats?.totalResumes || 0}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Match Score"
          value={`${stats?.avgMatchScore || 0}%`}
          color="amber"
          subtitle={`${stats?.totalApplications || 0} total applications`}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
        >
          Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`btn btn-sm ${activeTab === "jobs" ? "btn-primary" : "btn-secondary"}`}
        >
          Manage Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`btn btn-sm ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
        >
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`btn btn-sm ${activeTab === "applications" ? "btn-primary" : "btn-secondary"}`}
        >
          Candidate Applications ({applications.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {/* Match Distribution */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              AI Match Distribution
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>Highly Suitable (≥ 75%)</span>
                  <span>{stats?.matchDistribution?.highMatches || 0} candidates</span>
                </div>
                <div className="pillar-bar-bg">
                  <div
                    className="pillar-bar-fill"
                    style={{
                      width: `${((stats?.matchDistribution?.highMatches || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100}%`,
                      background: "var(--success)",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "var(--warning)", fontWeight: 600 }}>Moderately Suitable (50-74%)</span>
                  <span>{stats?.matchDistribution?.moderateMatches || 0} candidates</span>
                </div>
                <div className="pillar-bar-bg">
                  <div
                    className="pillar-bar-fill"
                    style={{
                      width: `${((stats?.matchDistribution?.moderateMatches || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100}%`,
                      background: "var(--warning)",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "var(--danger)", fontWeight: 600 }}>Needs Upskilling (&lt; 50%)</span>
                  <span>{stats?.matchDistribution?.lowMatches || 0} candidates</span>
                </div>
                <div className="pillar-bar-bg">
                  <div
                    className="pillar-bar-fill"
                    style={{
                      width: `${((stats?.matchDistribution?.lowMatches || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100}%`,
                      background: "var(--danger)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* College Viva Architecture Card */}
          <div className="card" style={{ background: "linear-gradient(135deg, #f8faff 0%, #edf5ff 100%)" }}>
            <h3 className="card-title" style={{ marginBottom: "0.75rem", color: "var(--primary)" }}>
              College Viva Architecture Summary
            </h3>
            <ul style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.7, paddingLeft: "1.2rem" }}>
              <li><b>Frontend:</b> React 18 + Vite (Clean JS, Responsive CSS tokens)</li>
              <li><b>Backend:</b> Node.js + Express.js REST API on port 5000</li>
              <li><b>Database:</b> MongoDB with auto in-memory fallback</li>
              <li><b>AI/NLP:</b> Python FastAPI on port 8000 using Scikit-Learn TF-IDF Cosine Similarity</li>
              <li><b>Weighted Formula:</b> 60% Skills + 20% Exp + 10% Edu + 10% Description similarity</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Jobs */}
      {activeTab === "jobs" && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Exp Required</th>
                  <th>Skills Needed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.experienceRequired} yrs</td>
                    <td>
                      <div className="skills-wrap">
                        {(job.requiredSkills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="skill-pill neutral" style={{ fontSize: "0.75rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => openEditJob(job)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Users */}
      {activeTab === "users" && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-amber" : "badge-blue"}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Switch to {u.role === "admin" ? "User" : "Admin"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Candidate Applications */}
      {activeTab === "applications" && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Title</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Missing Skills</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.user?.name || "Candidate"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {app.user?.email}
                      </div>
                    </td>
                    <td>{app.job?.title || "Job"}</td>
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
                      <select
                        className="form-select"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.82rem", width: "auto" }}
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="skills-wrap">
                        {(app.missingSkills || []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="skill-pill missing" style={{ fontSize: "0.72rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Job */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.4rem" }}>
                {editingJobId ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>
              <button
                onClick={() => setShowJobModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateJob}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Tech"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bangalore, Remote"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Workplace Type</label>
                  <select
                    className="form-select"
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Min Experience (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={jobForm.experienceRequired}
                    onChange={(e) => setJobForm({ ...jobForm, experienceRequired: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹10 - 15 LPA"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, MongoDB, Docker, Python"
                  value={jobForm.requiredSkills}
                  onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Education Degree</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Tech / B.E. / MCA in Computer Science"
                  value={jobForm.educationRequired}
                  onChange={(e) => setJobForm({ ...jobForm, educationRequired: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detail the key responsibilities, qualifications, and project scopes..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingJobId ? "Update Job" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
