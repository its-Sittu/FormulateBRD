from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

import google.generativeai as genai
from prompts import MASTER_PIPELINE_PROMPT, ANALYSIS_SYSTEM_PROMPT, BRD_GENERATION_PROMPT, GAP_ANALYSIS_PROMPT

app = FastAPI()

# --- Gemini Setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    USE_REAL_LLM = True
    print("✅ Gemini API configured successfully.")
else:
    gemini_model = None
    USE_REAL_LLM = False
    print("⚠️  No Gemini API key found. Running in MOCK mode.")

# --- Enron Dataset ---
ENRON_DATASET = []
from enron_loader import load_enron_sample

@app.on_event("startup")
async def startup_event():
    global ENRON_DATASET
    print("Loading Enron dataset sample...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, "dataset", "emails.csv")
    if os.path.exists(dataset_path):
        ENRON_DATASET = load_enron_sample(dataset_path, limit=5000)
        print(f"Loaded {len(ENRON_DATASET)} Enron emails.")
    else:
        print(f"Warning: Dataset not found at {dataset_path}")
        ENRON_DATASET = []

# --- CORS ---
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LLM Service ---

def call_gemini(prompt: str) -> str:
    """Call Gemini API and return the text response."""
    response = gemini_model.generate_content(prompt)
    return response.text

def generate_with_real_llm(user_input: str) -> dict:
    """3-stage Gemini pipeline: Analysis → BRD → Validation."""

    # Stage 1: Requirement Analysis
    print("Stage 1: Running Requirement Analysis...")
    analysis_prompt = ANALYSIS_SYSTEM_PROMPT.format(user_input=user_input)
    analysis = call_gemini(analysis_prompt)

    # Stage 2: BRD Generation
    print("Stage 2: Generating BRD...")
    brd_prompt = BRD_GENERATION_PROMPT.format(analysis_output=analysis)
    brd = call_gemini(brd_prompt)

    # Stage 3: Validation & Gap Analysis
    print("Stage 3: Running Validation...")
    gap_prompt = GAP_ANALYSIS_PROMPT.format(brd_output=brd)
    gaps = call_gemini(gap_prompt)

    return {
        "analysis": analysis,
        "brd": brd,
        "clarification_questions": gaps
    }

def generate_with_mock(text_input: str) -> dict:
    """Fallback mock pipeline when no API key is set."""
    import time
    time.sleep(1)
    analysis = f"""## Stage 1 — Requirement Analysis (Mock)

1. Business Problem:
   The user needs to process: "{text_input[:80]}..."

2. Business Objectives:
   - Automate BRD generation
   - Reduce manual documentation effort

3. Stakeholders / Users:
   - Business Analysts
   - Product Owners

4. Explicit Functional Requirements:
   - Input ingestion (text/files)
   - Structured BRD output

5. Explicit Constraints:
   - Must be accurate and hallucination-free

6. Missing or Unclear Information:
   - No timeline provided
   - No budget constraints mentioned
"""
    time.sleep(1)
    brd = """## Business Requirements Document (Mock)

### 1. Project Overview
AI-powered BRD generation system to convert unstructured business input into formal documentation.

### 2. Business Objectives
- Reduce time-to-draft by 50%
- Standardize BRD output format

### 3. Stakeholders
- **Primary**: Business Analysts, Product Owners
- **Secondary**: Development Teams

### 4. Functional Requirements
- **FR1**: System MUST accept text and file inputs
- **FR2**: System MUST generate structured BRD output
- **FR3**: System MUST identify requirement gaps

### 5. Non-Functional Requirements
- **NFR1** *(Inferred)*: Response time < 10 seconds
- **NFR2** *(Inferred)*: Data privacy compliant

### 6. Assumptions & Constraints
- *(Assumption)*: Input is provided in English
- *(Constraint)*: Web-based interface only

### 7. Success Metrics
- BRD accuracy validated by Business Analyst
"""
    gaps = """## Clarification Questions

1. **Timeline**: What is the expected delivery date for the MVP?
2. **Budget**: Are there budget constraints that affect scope?
3. **Integrations**: Are there specific tools to integrate with (Jira, Confluence)?
4. **Compliance**: Are there security/compliance requirements (GDPR, SOC2, HIPAA)?
"""
    return {
        "analysis": analysis,
        "brd": brd,
        "clarification_questions": gaps
    }

# --- API Endpoints ---

@app.post("/ingest")
async def ingest_data(files: List[UploadFile] = File(None), text: str = Form(...)):
    """Ingest text and files."""
    combined_context = text
    if files:
        file_names = ", ".join([f.filename for f in files if f.filename])
        if file_names:
            combined_context += f"\n\n[Attached Files: {file_names}]"
    return {"message": "Data ingested successfully", "context_preview": combined_context[:100]}

@app.post("/generate")
async def generate_brd(context: str = Form(...)):
    """Generate full BRD report. Uses Gemini if API key is set, else mock."""
    if USE_REAL_LLM:
        report = generate_with_real_llm(context)
    else:
        report = generate_with_mock(context)
    return report

@app.get("/enron/random")
async def get_random_enron_email():
    """Get a random email from the loaded Enron dataset."""
    import random
    if not ENRON_DATASET:
        return {"error": "Dataset not loaded or empty"}
    return random.choice(ENRON_DATASET)

@app.post("/enron/generate-brd")
async def generate_brd_from_email(email_context: str = Form(...)):
    """Generate BRD from an email context."""
    return await generate_brd(context=email_context)

@app.get("/")
def read_root():
    mode = "Gemini AI" if USE_REAL_LLM else "Mock"
    return {"status": "FormulateBRD API is running", "mode": mode}
