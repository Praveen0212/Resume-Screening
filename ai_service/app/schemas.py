from typing import List, Optional, Dict, Any
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

class ParsedResume(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    education: Optional[str] = "Bachelor's Degree"
    experience_years: float = 0.0
    skills: List[str] = []
    categorized_skills: Dict[str, List[str]] = {}
    summary: Optional[str] = ""
    raw_text: Optional[str] = ""

class MatchRequest(BaseModel):
    resume_skills: List[str] = []
    resume_experience: float = 0.0
    resume_education: Optional[str] = ""
    resume_text: Optional[str] = ""
    
    job_skills: List[str] = []
    job_experience: float = 0.0
    job_education: Optional[str] = ""
    job_description: Optional[str] = ""

class MatchScoreBreakdown(BaseModel):
    skills_score: float = Field(..., description="Calculated 0-100 score for skills match")
    skills_weighted: float = Field(..., description="60% weight contribution")
    
    experience_score: float = Field(..., description="Calculated 0-100 score for experience")
    experience_weighted: float = Field(..., description="20% weight contribution")
    
    education_score: float = Field(..., description="Calculated 0-100 score for education")
    education_weighted: float = Field(..., description="10% weight contribution")
    
    text_similarity_score: float = Field(..., description="Calculated 0-100 TF-IDF cosine similarity")
    text_similarity_weighted: float = Field(..., description="10% weight contribution")

class MatchResponse(BaseModel):
    match_score: float = Field(..., description="Final overall weighted score (0-100)")
    recommendation: str = Field(..., description="Highly Suitable | Moderately Suitable | Needs Upskilling")
    recommendation_color: str = Field(..., description="green | amber | red")
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    skill_gap_percentage: float = 0.0
    breakdown: MatchScoreBreakdown
    advice: List[str] = []

class JobItem(BaseModel):
    id: Optional[str] = ""
    title: str
    company: Optional[str] = ""
    location: Optional[str] = ""
    experience_required: float = 0.0
    required_skills: List[str] = []
    education_required: Optional[str] = ""
    description: Optional[str] = ""

class BatchMatchRequest(BaseModel):
    resume_skills: List[str] = []
    resume_experience: float = 0.0
    resume_education: Optional[str] = ""
    resume_text: Optional[str] = ""
    jobs: List[JobItem] = []

class RankedJobMatch(BaseModel):
    job: JobItem
    match_result: MatchResponse

class BatchMatchResponse(BaseModel):
    ranked_jobs: List[RankedJobMatch]
    total_evaluated: int
