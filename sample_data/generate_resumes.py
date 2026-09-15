import os
from docx import Document

os.makedirs("sample_data", exist_ok=True)
os.makedirs("backend/uploads", exist_ok=True)

# 1. Generate DOCX resume
doc = Document()
doc.add_heading("Praveen Kumar - Full Stack Developer", level=0)
doc.add_paragraph("Email: student@example.com | Phone: +91 91234 56789 | Location: Bangalore, India")
doc.add_paragraph("LinkedIn: linkedin.com/in/praveen-dev | GitHub: github.com/Praveen0212")

doc.add_heading("Professional Summary", level=1)
doc.add_paragraph(
    "Energetic Full Stack Developer with 2.5 years of hands-on experience designing and building scalable web applications. "
    "Expertise in React, Node.js, Express, MongoDB, Python, and RESTful microservices. "
    "Passionate about building intuitive user interfaces and resilient backend systems."
)

doc.add_heading("Technical Skills", level=1)
doc.add_paragraph("Languages: JavaScript, TypeScript, Python, Java, SQL, HTML5, CSS3")
doc.add_paragraph("Frontend: React, Redux, Tailwind, Vite, Responsive Design")
doc.add_paragraph("Backend & APIs: Node.js, Express, FastAPI, REST API, GraphQL")
doc.add_paragraph("Databases: MongoDB, PostgreSQL, MySQL, Redis, Mongoose")
doc.add_paragraph("Tools & DevOps: Git, Docker, AWS, Postman, Linux, Agile")

doc.add_heading("Work Experience", level=1)
doc.add_paragraph("Software Engineer | Apex Tech Labs (2024 - Present)")
doc.add_paragraph("• Architected responsive React components and state management pipelines.")
doc.add_paragraph("• Developed secure Express.js REST APIs with JWT authentication and MongoDB aggregation.")
doc.add_paragraph("• Integrated Docker container workflows and automated CI/CD testing.")

doc.add_paragraph("Junior Web Developer | CodeCraft Studio (2022 - 2024)")
doc.add_paragraph("• Built dynamic web portals using React, HTML5, CSS3, and Node.js.")
doc.add_paragraph("• Designed MongoDB database schemas and optimized indexing.")

doc.add_heading("Education", level=1)
doc.add_paragraph("Bachelor of Technology (B.Tech) in Computer Science & Engineering (2018 - 2022)")
doc.add_paragraph("First Class with Distinction - CGPA: 8.7/10")

doc_path = os.path.join("sample_data", "sample_resume_fullstack.docx")
doc.save(doc_path)
print(f"Created {doc_path}")

# Also copy to backend/uploads as sample_praveen_resume.docx
doc.save(os.path.join("backend", "uploads", "sample_praveen_resume.docx"))

# 2. Generate Text resume
txt_content = """Praveen Kumar
Email: student@example.com
Phone: +91 91234 56789
Location: Bangalore, India
Education: B.Tech in Computer Science and Engineering

SUMMARY:
Results-driven Full Stack Software Developer with 2.5 years of experience building modern web architectures using React, Node.js, Express, MongoDB, Python, and FastAPI.

TECHNICAL SKILLS:
- Languages: JavaScript, Python, Java, SQL, HTML5, CSS3
- Frontend: React, Redux, Tailwind, Vite
- Backend: Node.js, Express, FastAPI, REST API
- Databases: MongoDB, MySQL, PostgreSQL, Redis
- Cloud & DevOps: Git, Docker, AWS, Linux

WORK EXPERIENCE:
Full Stack Developer | Tech Innovations (2024 - Present)
- Developed RESTful microservices with Node.js and MongoDB.
- Implemented responsive user dashboards using React.
- Deployed microservices using Docker.

Junior Developer | WebSolutions Inc (2022 - 2024)
- Built web pages with HTML5, CSS3, JavaScript, and React.
- Designed database collections in MongoDB.

EDUCATION:
B.Tech in Computer Science and Engineering (2018 - 2022)
"""

txt_path = os.path.join("sample_data", "sample_resume_fullstack.txt")
with open(txt_path, "w", encoding="utf-8") as f:
    f.write(txt_content)
print(f"Created {txt_path}")

# 3. Python Data Scientist resume
ds_doc = Document()
ds_doc.add_heading("Ananya Sharma - AI & Data Science Specialist", level=0)
ds_doc.add_paragraph("Email: ananya.ds@example.com | Phone: +91 98888 12345 | Location: Hyderabad, India")
ds_doc.add_heading("Professional Summary", level=1)
ds_doc.add_paragraph("Data Scientist and Machine Learning Engineer with 3 years of experience in NLP, Scikit-learn, Python, FastAPI, and PyTorch.")
ds_doc.add_heading("Skills", level=1)
ds_doc.add_paragraph("Python, Machine Learning, Deep Learning, NLP, Scikit-learn, PyTorch, Pandas, NumPy, FastAPI, Docker, SQL, Git")
ds_doc.add_heading("Experience", level=1)
ds_doc.add_paragraph("Data Scientist | NeuralPulse Labs (2023 - Present) - 3 years experience")
ds_doc.add_paragraph("• Developed NLP text extraction and sentiment models.")
ds_doc.add_paragraph("• Created FastAPI prediction microservices containerized with Docker.")
ds_doc.add_heading("Education", level=1)
ds_doc.add_paragraph("M.Tech in Artificial Intelligence (2021 - 2023)")
ds_path = os.path.join("sample_data", "sample_resume_ai_datascientist.docx")
ds_doc.save(ds_path)
print(f"Created {ds_path}")

print("All sample resumes created successfully!")
