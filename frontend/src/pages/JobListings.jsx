import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { jobAPI, matchAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import {
  Search,
  MapPin,
  Filter,
  Briefcase,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

const JobListings = () => {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");
  const { isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [rankedMatches, setRankedMatches] = useState({});
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [jobType, setJobType] = useState("All");
  const [minMatch, setMinMatch] = useState(0);

  useEffect(() => {
    fetchJobsAndMatches();
  }, [minMatch, jobType]);

  const fetchJobsAndMatches = async () => {
    setLoading(true);
    try {
      // 1. Fetch base jobs
      const res = await jobAPI.getJobs({
        search: search || undefined,
        location: location || undefined,
        skill: skill || undefined,
        jobType: jobType !== "All" ? jobType : undefined,
      });
      const allJobs = res.data.jobs || [];
      setJobs(allJobs);

      // 2. If user is authenticated, fetch match scores for their resume
      if (isAuthenticated) {
        try {
          const recRes = await matchAPI.getRecommendations({
            resumeId: resumeIdParam || undefined,
            minMatch: minMatch > 0 ? minMatch : undefined,
          });

          const map = {};
          (recRes.data.ranked_jobs || []).forEach((item) => {
            const jId = item.job.id || item.job._id;
            map[jId] = item.match_result;
          });
          setRankedMatches(map);
        } catch (_) {}
      }
    } catch (err) {
      console.error("Jobs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobsAndMatches();
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setSkill("");
    setJobType("All");
    setMinMatch(0);
    // Refetch without filters
    setTimeout(fetchJobsAndMatches, 0);
  };

  // Filter jobs by minMatch if selected
  const displayedJobs = jobs.filter((job) => {
    if (minMatch > 0 && isAuthenticated) {
      const matchData = rankedMatches[job._id];
      if (!matchData || matchData.match_score < minMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>Explore Career Opportunities</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Find positions tailored to your profile or evaluate any job against our 60/20/10/10 AI matching model.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label className="form-label">Keyword / Job Title</label>
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.3rem" }}
                  placeholder="e.g. React, Full Stack..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Location</label>
              <div style={{ position: "relative" }}>
                <MapPin
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.3rem" }}
                  placeholder="e.g. Bangalore, Remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Required Skill</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Python, Docker, MongoDB"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Workplace Type</label>
              <select
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="All">All Workplace Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            {/* Match Score Filter */}
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Sparkles size={16} color="var(--primary)" />
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dark-navy)" }}>
                  Min AI Match:
                </span>
                <select
                  className="form-select"
                  style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                >
                  <option value={0}>All Scores (0%+)</option>
                  <option value={50}>Moderately Suitable (50%+)</option>
                  <option value={75}>Highly Suitable (75%+)</option>
                </select>
              </div>
            ) : (
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Sign in to filter jobs by your personalized AI match percentage.
              </span>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={resetFilters} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} /> Reset
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={14} /> Search Jobs
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Showing <b>{displayedJobs.length}</b> open positions
        </p>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Sparkles size={28} className="animate-spin" color="var(--primary)" />
          <p style={{ marginTop: "0.75rem", color: "var(--text-secondary)" }}>Searching jobs...</p>
        </div>
      ) : displayedJobs.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {displayedJobs.map((job) => {
            const matchData = rankedMatches[job._id];
            return (
              <JobCard
                key={job._id}
                job={job}
                matchScore={matchData?.match_score}
                recommendation={matchData?.recommendation}
              />
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>No matching jobs found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Try adjusting your search keywords, location, or lowering the minimum match score.
          </p>
          <button onClick={resetFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListings;
