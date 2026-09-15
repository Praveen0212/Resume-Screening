import React from "react";

const StatCard = ({ icon: Icon, title, value, color = "blue", subtitle }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={26} />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{title}</span>
        {subtitle && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
