import math
from typing import List, Dict, Tuple, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.schemas import MatchResponse, MatchScoreBreakdown
from app.extractor import SKILL_ALIASES

DEGREE_WEIGHTS: Dict[str, int] = {
    "ph.d.": 100,
    "m.tech": 90,
    "m.s.": 85,
    "mca": 80,
    "mba": 75,
    "b.tech": 75,
    "b.e.": 75,
    "b.s.": 70,
    "bca": 65,
    "b.sc": 65,
    "diploma": 50,
    "secondary": 30
}

def normalize_skill(skill: str) -> str:
    """Normalize a skill token for accurate set comparison."""
    cleaned = skill.strip().lower()
    return SKILL_ALIASES.get(cleaned, cleaned)

def calculate_skills_match(resume_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Compare resume skills vs job required skills.
    Returns (score_0_to_100, matched_skills, missing_skills).
    """
    if not required_skills:
        return 100.0, resume_skills, []
        
    norm_resume = {normalize_skill(s): s for s in resume_skills}
    norm_required = {normalize_skill(s): s for s in required_skills}
    
    matched = []
    missing = []
    
    for req_norm, orig_req in norm_required.items():
        found = False
        # Direct key match
        if req_norm in norm_resume:
            matched.append(orig_req)
            found = True
        else:
            # Substring check for compound terms e.g. "react" in "react.js"
            for res_norm, orig_res in norm_resume.items():
                if req_norm in res_norm or res_norm in req_norm:
                    matched.append(orig_req)
                    found = True
                    break
        if not found:
            missing.append(orig_req)
            
    # Calculate percentage of required skills satisfied
    match_ratio = len(matched) / len(norm_required)
    
    # Bonus points if candidate has extra relevant skills
    bonus = min(len(resume_skills) * 1.5, 10.0) if match_ratio > 0.5 else 0.0
    score = min(round((match_ratio * 100.0) + (bonus * 0.2), 1), 100.0)
    
    return score, sorted(matched), sorted(missing)

def calculate_experience_match(candidate_exp: float, required_exp: float) -> float:
    """
    Calculate 0-100 experience score.
    Candidate meets or exceeds = 100.
    Under requirement = proportional with graceful tolerance.
    """
    if required_exp <= 0.0:
        return 100.0
    if candidate_exp >= required_exp:
        return 100.0
        
    ratio = candidate_exp / required_exp
    # Give decent score for near-fits (e.g. 2 yrs for 3 yr job -> 75)
    score = round(max(20.0, ratio * 90.0), 1)
    return min(score, 100.0)

def calculate_education_match(candidate_edu: str, required_edu: str) -> float:
    """
    Calculate 0-100 score based on degree relevance.
    """
    if not required_edu or required_edu.strip() == "":
        return 90.0
        
    cand_lower = candidate_edu.lower()
    req_lower = required_edu.lower()
    
    cand_weight = 75
    for key, val in DEGREE_WEIGHTS.items():
        if key in cand_lower:
            cand_weight = val
            break
            
    req_weight = 70
    for key, val in DEGREE_WEIGHTS.items():
        if key in req_lower:
            req_weight = val
            break
            
    if cand_weight >= req_weight:
        return 100.0
    diff = req_weight - cand_weight
    return max(40.0, 100.0 - (diff * 2.0))

def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    """
    Calculate TF-IDF Cosine Similarity between resume text and job description.
    Fallback to word overlap if TF-IDF cannot run.
    """
    if not resume_text or not job_description:
        return 50.0
        
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Map cosine similarity (usually 0.1 - 0.7 for resumes) to a human-friendly 0-100 range
        scaled_sim = min(100.0, round(float(sim) * 160.0, 1))
        return max(scaled_sim, 25.0)
    except Exception:
        # Simple token intersection fallback
        res_words = set(resume_text.lower().split())
        job_words = set(job_description.lower().split())
        if not job_words:
            return 50.0
        common = len(res_words.intersection(job_words))
        ratio = common / min(len(job_words), 100)
        return min(round(ratio * 100.0, 1), 100.0)

def evaluate_job_match(
    resume_skills: List[str],
    resume_experience: float,
    resume_education: str,
    resume_text: str,
    job_skills: List[str],
    job_experience: float,
    job_education: str,
    job_description: str
) -> MatchResponse:
    """
    Master matching engine implementing:
    - Skills: 60%
    - Experience: 20%
    - Education: 10%
    - TF-IDF Text Similarity: 10%
    """
    # 1. Skills (60%)
    skills_score, matched_skills, missing_skills = calculate_skills_match(resume_skills, job_skills)
    skills_weighted = round(skills_score * 0.60, 2)
    
    # 2. Experience (20%)
    exp_score = calculate_experience_match(resume_experience, job_experience)
    exp_weighted = round(exp_score * 0.20, 2)
    
    # 3. Education (10%)
    edu_score = calculate_education_match(resume_education or "Bachelor's Degree", job_education or "")
    edu_weighted = round(edu_score * 0.10, 2)
    
    # 4. Description/Keywords (10%)
    text_score = calculate_text_similarity(resume_text or " ".join(resume_skills), job_description or " ".join(job_skills))
    text_weighted = round(text_score * 0.10, 2)
    
    # Final aggregate score
    total_match = round(skills_weighted + exp_weighted + edu_weighted + text_weighted, 1)
    total_match = min(max(total_match, 0.0), 100.0)
    
    # Recommendation status
    if total_match >= 75.0:
        recommendation = "Highly Suitable"
        recommendation_color = "green"
    elif total_match >= 50.0:
        recommendation = "Moderately Suitable"
        recommendation_color = "amber"
    else:
        recommendation = "Needs Upskilling"
        recommendation_color = "red"
        
    # Skill gap percentage
    total_req = len(job_skills)
    skill_gap = round((len(missing_skills) / total_req * 100.0), 1) if total_req > 0 else 0.0
    
    # Actionable advice tailored for candidate
    advice = []
    if missing_skills:
        advice.append(f"Focus on learning high-demand skills: {', '.join(missing_skills[:3])}.")
    if resume_experience < job_experience:
        advice.append(f"Highlight project contributions and open-source work to bridge the {job_experience - resume_experience:g}-year experience gap.")
    if total_match >= 75.0:
        advice.append("Strong profile alignment! Prepare for domain-specific technical interview rounds.")
    else:
        advice.append("Consider building a portfolio project showcasing the missing tech stack to increase your match percentage.")
        
    breakdown = MatchScoreBreakdown(
        skills_score=skills_score,
        skills_weighted=skills_weighted,
        experience_score=exp_score,
        experience_weighted=exp_weighted,
        education_score=edu_score,
        education_weighted=edu_weighted,
        text_similarity_score=text_score,
        text_similarity_weighted=text_weighted
    )
    
    return MatchResponse(
        match_score=total_match,
        recommendation=recommendation,
        recommendation_color=recommendation_color,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        skill_gap_percentage=skill_gap,
        breakdown=breakdown,
        advice=advice
    )
