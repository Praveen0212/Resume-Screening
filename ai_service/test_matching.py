from app.matcher import evaluate_job_match

def test_matching():
    resume_skills = ["Python", "FastAPI", "React", "MongoDB", "Git"]
    resume_exp = 2.5
    resume_edu = "B.Tech in Computer Science"
    resume_text = "Experienced software engineer working with Python, FastAPI, React, and MongoDB database architecture. Built RESTful microservices."

    job_skills = ["Python", "FastAPI", "Docker", "AWS", "MongoDB"]
    job_exp = 3.0
    job_edu = "Bachelor's Degree in CS"
    job_desc = "Looking for a Python Backend Developer skilled in FastAPI, MongoDB, Docker, and AWS cloud deployment. 3 years of experience required."

    result = evaluate_job_match(
        resume_skills=resume_skills,
        resume_experience=resume_exp,
        resume_education=resume_edu,
        resume_text=resume_text,
        job_skills=job_skills,
        job_experience=job_exp,
        job_education=job_edu,
        job_description=job_desc
    )

    print("--- Matching Test Result ---")
    print(f"Overall Match Score: {result.match_score}%")
    print(f"Recommendation: {result.recommendation} ({result.recommendation_color})")
    print(f"Matched Skills: {result.matched_skills}")
    print(f"Missing Skills: {result.missing_skills}")
    print(f"Skill Gap: {result.skill_gap_percentage}%")
    print(f"Breakdown: Skills(60%)={result.breakdown.skills_weighted}, Exp(20%)={result.breakdown.experience_weighted}, Edu(10%)={result.breakdown.education_weighted}, Text(10%)={result.breakdown.text_similarity_weighted}")
    print(f"Advice: {result.advice}")

    assert result.match_score > 0
    assert "FastAPI" in result.matched_skills or "fastapi" in [s.lower() for s in result.matched_skills]
    assert len(result.missing_skills) > 0
    print("ALL ASSERTIONS PASSED!")

if __name__ == "__main__":
    test_matching()
