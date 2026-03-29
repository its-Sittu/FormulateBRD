from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import List
import os, time
from datetime import datetime
from dotenv import load_dotenv
import traceback

# Load .env from same directory as this file (robust across reloads)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=_env_path, override=True)

from prompts import ANALYSIS_SYSTEM_PROMPT, BRD_GENERATION_PROMPT, GAP_ANALYSIS_PROMPT, REFINEMENT_PROMPT

app = FastAPI()

# --- Global Exception Handlers ---
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch all unhandled exceptions and return 500 with details"""
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    error_trace = traceback.format_exc()
    print(f"🔴 UNHANDLED ERROR: {error_msg}\n{error_trace}")
    return {"error": "Internal Server Error", "detail": error_msg}

# --- Provider Setup ---
# Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    from google import genai
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    print(f"✅ Gemini AI configured with key: {GEMINI_API_KEY[:10]}...")

@app.get("/debug")
async def debug_info():
    return {
        "gemini_key_exists": GEMINI_API_KEY is not None,
        "gemini_key_valid_prefix": GEMINI_API_KEY.startswith("AIza") if GEMINI_API_KEY else False,
        "gemini_client_exists": gemini_client is not None,
        "openai_key_exists": OPENAI_API_KEY is not None,
        "anthropic_key_exists": CLAUDE_API_KEY is not None,
        "env_path": _env_path,
        "os_cwd": os.getcwd()
    }

# OpenAI (Placeholders for user to add keys)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# Claude
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

def get_active_model_info():
    if gemini_client: return "Gemini 1.5 Flash", "google"
    return "Mock Intelligence", "mock"

# --- Session Metrics & Persistence ---
TELEMETRY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry.json")

SESSION_STATS = {
    "brd_count": 0,
    "success_count": 0,
    "error_count": 0,
    "enron_fetches": 0,
    "server_start": time.time(),
}

def load_telemetry():
    global SESSION_STATS
    if os.path.exists(TELEMETRY_FILE):
        try:
            import json
            with open(TELEMETRY_FILE, "r") as f:
                data = json.load(f)
                SESSION_STATS["brd_count"] = data.get("brd_count", 0)
                SESSION_STATS["success_count"] = data.get("success_count", 0)
                SESSION_STATS["error_count"] = data.get("error_count", 0)
                SESSION_STATS["enron_fetches"] = data.get("enron_fetches", 0)
                print(f"📊 Telemetry restored: {SESSION_STATS['brd_count']} BRDs generated to date.")
        except Exception as e:
            print(f"⚠️ Failed to load telemetry: {e}")

def save_telemetry():
    try:
        import json
        with open(TELEMETRY_FILE, "w") as f:
            json.dump({
                "brd_count": SESSION_STATS["brd_count"],
                "success_count": SESSION_STATS["success_count"],
                "error_count": SESSION_STATS["error_count"],
                "enron_fetches": SESSION_STATS["enron_fetches"]
            }, f)
    except Exception as e:
        print(f"⚠️ Failed to save telemetry: {e}")

load_telemetry()

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
    "http://localhost:8000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8080",
]

# Add production client URL if set
_client_url = os.getenv("CLIENT_URL")
if _client_url:
    origins.append(_client_url)

# For port forwarding scenarios: allow from env variable or enable all origins in dev
_allow_all_origins = os.getenv("CORS_ALLOW_ALL", "false").lower() == "true"
if _allow_all_origins:
    print("⚠️  CORS_ALLOW_ALL enabled - allowing requests from all origins")
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LLM Helpers ---

def call_llm(prompt: str, provider: str = "google", model: str = "gemini-flash") -> str:
    """Unified LLM caller with routing logic."""
    if provider == "google" and gemini_client:
        max_retries = 3
        base_delay = 2
        for attempt in range(max_retries):
            try:
                response = gemini_client.models.generate_content(
                    model="models/gemini-flash-latest",
                    contents=prompt
                )
                return response.text
            except Exception as e:
                err_msg = str(e)
                if ("503" in err_msg or "429" in err_msg) and attempt < max_retries - 1:
                    wait_time = base_delay * (2 ** attempt)
                    time.sleep(wait_time)
                    continue
                raise e
    
    # Placeholder routing for OpenAI/Claude
    if provider == "openai":
        return f"## OpenAI Placeholder Output\n\n(OpenAI API Key Required for '{model}')\n\nTo enable, add OPENAI_API_KEY to your server/.env file."
    if provider == "anthropic":
        return f"## Claude Placeholder Output\n\n(Claude API Key Required for '{model}')\n\nTo enable, add CLAUDE_API_KEY to your server/.env file."

    return "Mock Engine: Provider Not Configured."

from prompts import MASTER_PIPELINE_PROMPT

def generate_with_real_llm(user_input: str, provider: str = "google", model: str = "gemini-flash") -> dict:
    """Optimized multi-model pipeline."""
    try:
        print(f"Executing Pipeline via {provider.upper()} ({model})...")
        full_output = call_llm(MASTER_PIPELINE_PROMPT.format(user_input=user_input), provider, model)
        
        # Split logic remains the same (unified prompt structure)
        sections = full_output.split("STAGE ")
        analysis = sections[1] if len(sections) > 1 else "Analysis extraction failed."
        brd = sections[2] if len(sections) > 2 else "BRD generation failed."
        gaps = sections[3] if len(sections) > 3 else "Validation failed."

        return {
            "analysis": f"## Stage 1 — Requirement Analysis ({provider})\n\n{analysis}", 
            "brd": f"## Stage 2 — Business Requirements Document ({model})\n\n{brd}", 
            "clarification_questions": f"## Stage 3 — Validation\n\n{gaps}"
        }
    except Exception as e:
        print(f"⚠️ Engine Error: {str(e)}")
        return generate_with_mock(user_input)

def generate_with_mock(text_input: str) -> dict:
    """Instant fallback mock responses (removed artificial sleep)."""
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
async def generate_brd(context: str = Form(...)): # Reverted to single param
    """Generate full BRD using Gemini (Primary Engine)."""
    print("🚀 GENERATION REQUEST: [GEMINI FOCUS]")
    SESSION_STATS["brd_count"] += 1
    save_telemetry()
    try:
        if gemini_client:
            report = generate_with_real_llm(context, "google", "gemini-flash")
        else:
            report = generate_with_mock(context)
            report["brd"] = "⚠️ **Gemini Not Configured**. Showing mock analysis.\n\n" + report["brd"]
        
        SESSION_STATS["success_count"] += 1
        return report
    except Exception as e:
        SESSION_STATS["error_count"] += 1
        error_msg = str(e)
        print(f"❌ Generation Error: {error_msg}")
        # Return graceful error response instead of raising
        return {
            "analysis": "Error during analysis phase",
            "brd": f"## ❌ Generation Failed\n\nError: {error_msg[:500]}",
            "clarification_questions": "Please retry or check server logs for details."
        }

@app.post("/refine")
async def refine_brd(original_report: str = Form(...), feedback: str = Form(...)): # Reverted to single param
    """Refine an existing BRD using Gemini."""
    SESSION_STATS["brd_count"] += 1
    save_telemetry()
    try:
        if gemini_client:
            prompt = REFINEMENT_PROMPT.format(original_report=original_report, feedback=feedback)
            refined_content = call_llm(prompt, "google", "gemini-flash")
            report = {
                "analysis": "Analysis updated via Gemini.",
                "brd": refined_content,
                "clarification_questions": "Validation refreshed."
            }
        else:
            report = generate_with_mock(f"REFINED: {feedback}")
            report["brd"] = f"### REFINED VERSION (Mock fallback)\n\n{report['brd']}"
        
        SESSION_STATS["success_count"] += 1
        return report
    except Exception as e:
        SESSION_STATS["error_count"] += 1
        error_msg = str(e)
        print(f"❌ Refinement Error: {error_msg}")
        # Return graceful error response instead of raising
        return {
            "analysis": "Error during refinement",
            "brd": f"## ❌ Refinement Failed\n\nError: {error_msg[:500]}",
            "clarification_questions": "Please retry or check server logs for details."
        }

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
        "ai_mode": "Advanced AI Product Architect",
        "gemini_active": gemini_client is not None,
        "server_time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }


# --- Static File Serving (for production) ---
# Mount the dist folder from the client build
dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "client", "dist")

if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If the file exists in dist, serve it (e.g. favicon.ico)
    potential_file = os.path.join(dist_path, full_path)
    if os.path.isfile(potential_file):
        return FileResponse(potential_file)
    
    # Otherwise, serve index.html for SPA routing
    index_file = os.path.join(dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    # Fallback if dist isn't built yet
    return {"status": "Backend Live", "message": "Frontend build not found. Visit API docs at /docs"}

@app.get("/")
def read_root():
    return FileResponse(os.path.join(dist_path, "index.html")) if os.path.exists(os.path.join(dist_path, "index.html")) else {"status": "FormulateBRD API is running"}
