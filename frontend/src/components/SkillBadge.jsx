import React from "react";
import { Check, X, Tag } from "lucide-react";

const SkillBadge = ({ skill, type = "neutral" }) => {
  return (
    <span className={`skill-pill ${type}`}>
      {type === "matched" && <Check size={13} strokeWidth={3} />}
      {type === "missing" && <X size={13} strokeWidth={3} />}
      {type === "neutral" && <Tag size={12} />}
      <span>{skill}</span>
    </span>
  );
};

export default SkillBadge;
