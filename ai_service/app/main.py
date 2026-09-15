import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from app.schemas import (
    ParsedResume, MatchRequest, MatchResponse,
    BatchMatchRequest, BatchMatchResponse, RankedJobMatch
)
from app.extractor import parse_resume_content, extract_candidate_name, extract_email, extract_phone, extract_education, extract_experience_years, extract_skills
from app.matcher import evaluate_job_match

app = FastAPI(
    title="AI-Based Resume Screening & Job Matching NLP Service",
    description="Microservice for PDF/DOCX resume parsing and 60/20/10/10 weighted AI job matching",
    version="1.0.0"
)

# Enable CORS for frontend and node backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "AI-Based Resume Screening & Job Matching NLP Engine",
        "status": "online",
        "version": "1.0.0",
        "endpoints": ["/health", "/api/parse", "/api/parse-text", "/api/match", "/api/match-batch"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "nlp_engine": "scikit-learn + pypdf + docx"}

@app.post("/api/parse", response_model=ParsedResume)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Extract candidate details, skills, education, and experience from PDF/DOCX resume."""
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        parsed = parse_resume_content(content, file.filename or "resume.pdf")
        return ParsedResume(**parsed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")

@app.post("/api/parse-text", response_model=ParsedResume)
async def parse_resume_text_endpoint(raw_text: str = Form(...)):
    """Parse resume from raw pasted text."""
    try:
        candidate_name = extract_candidate_name(raw_text)
        email = extract_email(raw_text)
        phone = extract_phone(raw_text)
        education = extract_education(raw_text)
        experience_years = extract_experience_years(raw_text)
        skills, categorized = extract_skills(raw_text)
        summary = f"{candidate_name} holds {education} with ~{experience_years:g} years of experience and proficiencies in {', '.join(skills[:5]) if skills else 'Software Development'}."
        
        return ParsedResume(
            candidate_name=candidate_name,
            email=email,
            phone=phone,
            education=education,
            experience_years=experience_years,
            skills=skills,
            categorized_skills=categorized,
            summary=summary,
            raw_text=raw_text[:5000]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text parsing failed: {str(e)}")

@app.post("/api/match", response_model=MatchResponse)
async def match_resume_with_job(req: MatchRequest):
    """
    Evaluate candidate resume against a job using:
    - Skills (60%)
    - Experience (20%)
    - Education (10%)
    - Keyword/TF-IDF Cosine Similarity (10%)
    """
    try:
        result = evaluate_job_match(
            resume_skills=req.resume_skills,
            resume_experience=req.resume_experience,
            resume_education=req.resume_education or "",
            resume_text=req.resume_text or "",
            job_skills=req.job_skills,
            job_experience=req.job_experience,
            job_education=req.job_education or "",
            job_description=req.job_description or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching calculation failed: {str(e)}")

@app.post("/api/match-batch", response_model=BatchMatchResponse)
async def match_resume_batch(req: BatchMatchRequest):
    """Rank a list of jobs for a given candidate resume, sorted by match percentage descending."""
    try:
        ranked = []
        for job in req.jobs:
            eval_res = evaluate_job_match(
                resume_skills=req.resume_skills,
                resume_experience=req.resume_experience,
                resume_education=req.resume_education or "",
                resume_text=req.resume_text or "",
                job_skills=job.required_skills,
                job_experience=job.experience_required,
                job_education=job.education_required or "",
                job_description=job.description or ""
            )
            ranked.append(RankedJobMatch(job=job, match_result=eval_res))
            
        # Sort ranked jobs descending by match_score
        ranked.sort(key=lambda x: x.match_result.match_score, reverse=True)
        return BatchMatchResponse(ranked_jobs=ranked, total_evaluated=len(ranked))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch matching failed: {str(e)}")
