from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os, time
from datetime import datetime
from dotenv import load_dotenv

# Load .env from same directory as this file (robust across reloads)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=_env_path, override=True)

from prompts import ANALYSIS_SYSTEM_PROMPT, BRD_GENERATION_PROMPT, GAP_ANALYSIS_PROMPT

app = FastAPI()

# --- Gemini Setup (new google.genai SDK) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    from google import genai
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    GEMINI_MODEL = "models/gemini-flash-latest"
    USE_REAL_LLM = True
    print("✅ Gemini API configured successfully.")
else:
    gemini_client = None
    USE_REAL_LLM = False
    print("⚠️  No Gemini API key found. Running in MOCK mode.")

# --- Session Metrics (in-memory) ---
SESSION_STATS = {
    "brd_count": 0,
    "success_count": 0,
    "error_count": 0,
    "enron_fetches": 0,
    "server_start": time.time(),
}

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

# --- LLM Helpers ---

def call_gemini(prompt: str) -> str:
    """Call Gemini using the new google.genai SDK. Raises on error."""
    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )
    return response.text

def generate_with_real_llm(user_input: str) -> dict:
    """Real 3-stage Gemini pipeline: Analysis → BRD → Validation."""
    try:
        print("Stage 1: Requirement Analysis...")
        analysis = call_gemini(ANALYSIS_SYSTEM_PROMPT.format(user_input=user_input))

        print("Stage 2: BRD Generation...")
        brd = call_gemini(BRD_GENERATION_PROMPT.format(analysis_output=analysis))

        print("Stage 3: Validation & Gap Analysis...")
        gaps = call_gemini(GAP_ANALYSIS_PROMPT.format(brd_output=brd))

        return {"analysis": analysis, "brd": brd, "clarification_questions": gaps}

    except Exception as e:
        err = str(e)
        print(f"⚠️ Gemini error, falling back to mock: {err[:100]}")
        result = generate_with_mock(user_input)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            result["brd"] = "⚠️ **Gemini rate limit reached** (free tier). Showing mock output.\n\n" + result["brd"]
        else:
            result["brd"] = f"⚠️ **Gemini error**: {err[:100]}\n\nShowing mock output:\n\n" + result["brd"]
        return result

def generate_with_mock(text_input: str) -> dict:
    """Fallback mock responses when no API key is configured."""
    import time
    time.sleep(1)
    analysis = f"""## Stage 1 — Requirement Analysis (Mock)

1. Business Problem:
   "{text_input[:80]}..."

2. Business Objectives:
   - Automate BRD generation
   - Reduce manual documentation effort

3. Stakeholders / Users:
   - Business Analysts, Product Owners

4. Explicit Functional Requirements:
   - Input ingestion (text/files)
   - Structured BRD output

5. Explicit Constraints:
   - Must be accurate and hallucination-free

6. Missing or Unclear Information:
   - No timeline provided
   - No budget constraints mentioned
"""
    brd = """## Business Requirements Document (Mock)

### 1. Project Overview
AI-powered BRD generation system.

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
- *(Assumption)*: Input is in English
- *(Constraint)*: Web-based interface only

### 7. Success Metrics
- BRD accuracy validated by Business Analyst
"""
    gaps = """## Clarification Questions

1. **Timeline**: What is the expected delivery date for the MVP?
2. **Budget**: Are there budget constraints that affect scope?
3. **Integrations**: Specific tools needed (Jira, Confluence)?
4. **Compliance**: Any security/compliance requirements (GDPR, SOC2)?
"""
    return {"analysis": analysis, "brd": brd, "clarification_questions": gaps}

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
    """Generate full BRD. Uses Gemini if API key is set, else mock."""
    SESSION_STATS["brd_count"] += 1
    try:
        if USE_REAL_LLM:
            report = generate_with_real_llm(context)
        else:
            report = generate_with_mock(context)
        SESSION_STATS["success_count"] += 1
        return report
    except Exception as e:
        SESSION_STATS["error_count"] += 1
        raise e

@app.get("/enron/random")
async def get_random_enron_email():
    """Get a random email from the Enron dataset."""
    import random
    if not ENRON_DATASET:
        return {"error": "Dataset not loaded or empty"}
    SESSION_STATS["enron_fetches"] += 1
    return random.choice(ENRON_DATASET)

@app.post("/enron/generate-brd")
async def generate_brd_from_email(email_context: str = Form(...)):
    """Generate BRD from an email context."""
    return await generate_brd(context=email_context)

@app.get("/stats")
def get_stats():
    """Return real-time session statistics for the dashboard."""
    uptime_secs = int(time.time() - SESSION_STATS["server_start"])
    uptime_min = uptime_secs // 60
    uptime_hrs = uptime_min // 60
    if uptime_hrs > 0:
        uptime_str = f"{uptime_hrs}h {uptime_min % 60}m"
    elif uptime_min > 0:
        uptime_str = f"{uptime_min}m {uptime_secs % 60}s"
    else:
        uptime_str = f"{uptime_secs}s"

    success_rate = 0
    if SESSION_STATS["brd_count"] > 0:
        success_rate = round((SESSION_STATS["success_count"] / SESSION_STATS["brd_count"]) * 100)

    return {
        "brd_count": SESSION_STATS["brd_count"],
        "success_count": SESSION_STATS["success_count"],
        "error_count": SESSION_STATS["error_count"],
        "enron_fetches": SESSION_STATS["enron_fetches"],
        "enron_loaded": len(ENRON_DATASET),
        "success_rate": success_rate,
        "uptime": uptime_str,
        "ai_mode": "Gemini AI" if USE_REAL_LLM else "Mock",
        "model": GEMINI_MODEL if USE_REAL_LLM else "mock-llm",
        "server_time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }

@app.get("/")
def read_root():
    mode = "Gemini AI" if USE_REAL_LLM else "Mock"
    return {"status": "FormulateBRD API is running", "mode": mode}
