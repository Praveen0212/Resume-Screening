import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_resume_pdf(filename, name, title, contact_info, summary, skills_dict, experience_list, education_info):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "ResumeTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#0052cc"),
        spaceAfter=4
    )
    
    sub_style = ParagraphStyle(
        "ResumeSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#4a5568"),
        spaceAfter=10
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#0d3880"),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2d3748")
    )

    story = []
    # Header
    story.append(Paragraph(f"<b>{name}</b> - {title}", title_style))
    story.append(Paragraph(contact_info, sub_style))
    story.append(Spacer(1, 6))

    # Summary
    story.append(Paragraph("<b>PROFESSIONAL SUMMARY</b>", section_heading))
    story.append(Paragraph(summary, body_style))
    story.append(Spacer(1, 6))

    # Skills
    story.append(Paragraph("<b>TECHNICAL PROFICIENCIES & SKILLS</b>", section_heading))
    for category, skill_list in skills_dict.items():
        line = f"<b>{category}:</b> {', '.join(skill_list)}"
        story.append(Paragraph(line, body_style))
    story.append(Spacer(1, 6))

    # Experience
    story.append(Paragraph("<b>WORK EXPERIENCE</b>", section_heading))
    for exp in experience_list:
        story.append(Paragraph(f"<b>{exp['role']}</b> | {exp['company']} ({exp['duration']})", body_style))
        for bullet in exp['points']:
            story.append(Paragraph(f"• {bullet}", body_style))
        story.append(Spacer(1, 4))

    # Education
    story.append(Paragraph("<b>EDUCATION</b>", section_heading))
    story.append(Paragraph(education_info, body_style))

    doc.build(story)
    print(f"Generated PDF: {filename}")

if __name__ == "__main__":
    os.makedirs("sample_data", exist_ok=True)
    os.makedirs("backend/uploads", exist_ok=True)

    # 1. Praveen Full Stack Resume
    create_resume_pdf(
        "sample_data/sample_resume_fullstack.pdf",
        name="Praveen Kumar",
        title="Full Stack Software Engineer",
        contact_info="Email: student@example.com | Phone: +91 91234 56789 | Bangalore, India | GitHub: github.com/Praveen0212",
        summary="Dynamic Full Stack Developer with 2.5 years of industry experience specializing in React, Node.js, Express, MongoDB, Python, and microservices architecture. Dedicated to building responsive web applications and reliable RESTful APIs.",
        skills_dict={
            "Programming Languages": ["JavaScript", "TypeScript", "Python", "Java", "SQL", "HTML5", "CSS3"],
            "Frontend Frameworks": ["React", "Redux", "Tailwind", "Vite", "Next.js"],
            "Backend & APIs": ["Node.js", "Express", "FastAPI", "REST API", "Microservices"],
            "Databases & Storage": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Mongoose"],
            "DevOps & Tools": ["Git", "Docker", "AWS", "Postman", "Linux", "CI/CD", "Agile"]
        },
        experience_list=[
            {
                "role": "Full Stack Developer",
                "company": "Apex Cloud Systems",
                "duration": "2024 - Present (2 years)",
                "points": [
                    "Engineered modular React frontends paired with Express.js microservices and MongoDB storage.",
                    "Improved API throughput by 35% through Redis caching and optimized Mongoose indexing.",
                    "Automated unit testing using Jest and containerized deployments using Docker."
                ]
            },
            {
                "role": "Junior Web Developer",
                "company": "CodeNova Labs",
                "duration": "2022 - 2024",
                "points": [
                    "Built 10+ responsive client web applications using React, HTML5, CSS3, and Node.js.",
                    "Configured JWT authentication and role-based access control policies."
                ]
            }
        ],
        education_info="<b>Bachelor of Technology (B.Tech) in Computer Science & Engineering</b><br/>Visvesvaraya Technological University (2018 - 2022) | First Class with Distinction (CGPA: 8.8/10)"
    )

    # Also copy to backend/uploads for immediate testing
    import shutil
    shutil.copy("sample_data/sample_resume_fullstack.pdf", "backend/uploads/sample_praveen_resume.pdf")

    # 2. Frontend Specialist Resume
    create_resume_pdf(
        "sample_data/sample_resume_frontend.pdf",
        name="Rahul Verma",
        title="Frontend React Specialist",
        contact_info="Email: rahul.v@example.com | Phone: +91 97777 65432 | Pune, India",
        summary="Passionate Frontend Developer with 2 years of experience crafting modern, accessible web applications using React, JavaScript, Vite, Tailwind, and Redux.",
        skills_dict={
            "Core Technologies": ["JavaScript", "HTML5", "CSS3", "Responsive Design"],
            "Frameworks & State": ["React", "Redux", "Tailwind", "Vite", "Next.js"],
            "Tools": ["Git", "Figma", "Postman", "REST API", "Jest"]
        },
        experience_list=[
            {
                "role": "Frontend Developer",
                "company": "PixelCraft Media",
                "duration": "2023 - Present (2 years)",
                "points": [
                    "Developed reusable component libraries with React and modern responsive CSS.",
                    "Integrated REST APIs and streamlined Redux state flow."
                ]
            }
        ],
        education_info="<b>Bachelor of Science (B.Sc) in Computer Science</b><br/>Pune University (2019 - 2023)"
    )
    print("PDF generation completed successfully!")
