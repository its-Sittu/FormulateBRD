from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import time

app = FastAPI()

# Enron Dataset (Loaded on Startup)
ENRON_DATASET = []
from enron_loader import load_enron_sample

import os

@app.on_event("startup")
async def startup_event():
    global ENRON_DATASET
    print("Loading Enron dataset sample...")
    # Path to dataset (Relative to this script)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, "dataset", "emails.csv")
    
    if os.path.exists(dataset_path):
        ENRON_DATASET = load_enron_sample(dataset_path, limit=5000)
        print(f"Loaded {len(ENRON_DATASET)} Enron emails.")
    else:
        print(f"Warning: Dataset not found at {dataset_path}")
        ENRON_DATASET = []

# CORS configuration
origins = [
    "http://localhost:5173",  # React app
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Data / Prompt Engineering Logic ---

class MockLLMService:
    def generate_full_report(self, text_input: str):
        """Simulate a multi-stage LLM pipeline."""
        time.sleep(1) # Stage 1 Analysis
        
        analysis = f"""# Requirement Analysis Report (Mock)

1. Business Problem:
   The user needs to process the following input: "{text_input[:50]}...".

2. Business Goals:
   *   Automate documentation.
   *   Reduce manual analysis time.

3. Target Users / Stakeholders:
   *   Business Analysts
   *   Product Owners

4. Key Functional Needs (explicit only):
   *   Input ingestion
   *   Multi-stage processing
   *   Export to PDF (inferred)

5. Constraints (explicit only):
   *   Must be accurate.

6. Missing or Unclear Information:
   *   Timeline?
   *   Budget?
"""
        time.sleep(1) # Stage 2 BRD
        
        brd = f"""# Business Requirements Document

## 1. Project Overview
The "Auto-BRD" project aims to streamline the creation of requirement documents using AI agents.

## 2. Business Objectives
- Reduce time-to-draft by 50%.
- Standardize output format.

## 3. Stakeholders
- **Primary**: Business Analysts
- **Secondary**: Developers (consumers of BRD)

## 4. Functional Requirements
- **FR1**: System MUST accept text and file inputs.
- **FR2**: System MUST generate a structured BRD based on the analysis.
- **FR3**: System MUST identify gaps in requirements.

## 5. Non-Functional Requirements
- **NFR1**: Response time < 5 seconds for draft generation.
- **NFR2**: Data privacy compliant (GDPR).

## 6. Assumptions & Constraints
- **Assumption (Inferred)**: Users provide English input.
- **Constraint**: Web-based interface only.

## 7. Success Metrics
- User adoption rate > 30% in first month.
"""

        time.sleep(1) # Stage 3 Gap Analysis
        
        gaps = f"""# Clarification Questions

1.  **Timeline**: What is the expected delivery date for the MVP?
2.  **Integration**: Are there specific 3rd-party tools (Jira, Confluence) we need to integrate with?
3.  **Security**: Do we need specific compliance certifications (SOC2, HIPAA)?
"""
        
        return {
            "analysis": analysis,
            "brd": brd,
            "clarification_questions": gaps
        }

llm_service = MockLLMService()

@app.post("/ingest")
async def ingest_data(files: List[UploadFile] = File(None), text: str = Form(...)):
    """Ingest text and files (mock processing)."""
    # In a real app, we would parse files here (PDF/Docx)
    # For MVP, we just combine text and file names
    combined_context = text
    if files:
        file_names = ", ".join([f.filename for f in files])
        combined_context += f"\n\n[Attached Files: {file_names}]"
    
    return {"message": "Data ingested successfully", "context_preview": combined_context[:100]}

@app.post("/generate")
async def generate_brd(context: str = Form(...)):
    """Generate full BRD report from context."""
    report = llm_service.generate_full_report(context)
    return report

@app.get("/enron/random")
async def get_random_enron_email():
    """Get a random email from the loaded Enron dataset."""
    import random
    if not ENRON_DATASET:
        return {"error": "Dataset not loaded or empty"}
    
    email_data = random.choice(ENRON_DATASET)
    return email_data

@app.post("/enron/generate-brd")
async def generate_brd_from_email(email_context: str = Form(...)): # simplified for MVP
    """Generate BRD specifically from an email context."""
    return await generate_brd(context=email_context)

@app.get("/")
def read_root():
    return {"status": "Auto-BRD Generator API is running"}
