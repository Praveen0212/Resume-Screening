import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Briefcase,
  LayoutDashboard,
  Upload,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="nav-brand">
        <div className="brand-icon">
          <Sparkles size={22} />
        </div>
        <div>
          Resume<span>AI</span> Matcher
        </div>
      </Link>

      <ul className="nav-links">
        {isAuthenticated ? (
          <>
            <li>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/upload"
                className={`nav-link ${isActive("/upload") ? "active" : ""}`}
              >
                <Upload size={18} />
                <span>Upload Resume</span>
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className={`nav-link ${isActive("/jobs") ? "active" : ""}`}
              >
                <Briefcase size={18} />
                <span>Jobs</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                >
                  <ShieldCheck size={18} />
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/profile"
                className={`nav-link ${isActive("/profile") ? "active" : ""}`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: "0.5rem" }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
