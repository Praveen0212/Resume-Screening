import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Sparkles, AlertCircle, Key, UserCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to log in. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div style={{ maxWidth: "480px", margin: "3rem auto" }}>
      <div className="card" style={{ padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="brand-icon"
            style={{ width: "48px", height: "48px", margin: "0 auto 1rem" }}
          >
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>Sign In to ResumeAI</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            Smart NLP Screening & Job Suitability Platform
          </p>
        </div>

        {error && (
          <div
            className="badge badge-red"
            style={{ width: "100%", padding: "0.75rem 1rem", marginBottom: "1.25rem", borderRadius: "var(--radius-md)" }}
          >
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.75rem", padding: "0.8rem" }}
            disabled={loading}
          >
            <LogIn size={18} /> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ margin: "1.75rem 0 1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            One-Click Viva & Demo Logins
          </span>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
            <button
              type="button"
              onClick={() => fillCredentials("student@example.com", "student123")}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <UserCheck size={14} /> Student Demo
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("admin@resumematch.com", "admin123")}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <Key size={14} /> Admin Demo
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don't have an account yet?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
