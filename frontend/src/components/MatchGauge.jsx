import React from "react";

const MatchGauge = ({ score = 0, recommendation = "Evaluating...", subtitle = "Overall AI Match" }) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const cleanScore = Math.min(Math.max(Math.round(score), 0), 100);
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  let strokeColor = "#de350b"; // Red
  let badgeClass = "badge-red";

  if (cleanScore >= 75) {
    strokeColor = "#00875a"; // Green
    badgeClass = "badge-green";
  } else if (cleanScore >= 50) {
    strokeColor = "#ff8b00"; // Amber
    badgeClass = "badge-amber";
  }

  return (
    <div className="match-gauge-card">
      <div className="gauge-circle">
        <svg className="gauge-svg" viewBox="0 0 160 160">
          <circle
            className="gauge-bg"
            cx="80"
            cy="80"
            r={radius}
          />
          <circle
            className="gauge-progress"
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="gauge-score-text">
          <span className="gauge-score-number">{cleanScore}%</span>
          <span className="gauge-score-label">MATCH</span>
        </div>
      </div>

      <div style={{ marginTop: "0.25rem" }}>
        <span className={`badge ${badgeClass}`} style={{ fontSize: "0.9rem", padding: "0.35rem 0.9rem" }}>
          {recommendation}
        </span>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
        {subtitle}
      </p>
    </div>
  );
};

export default MatchGauge;
