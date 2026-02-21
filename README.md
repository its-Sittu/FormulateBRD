##FormulateBRD: An agentic Business Analyst


# Auto-BRD Generator

A modern, AI-powered Business Requirements Document (BRD) generator with an enterprise-grade dashboard, Enron dataset integration, and a mock 3-stage prompt engineering pipeline.

## 📦 Project Structure

```text
/client      -> React + Vite Frontend (Dashboard UI)
/server      -> Python FastAPI Backend (LLM Mock & Data Logic)
/dataset     -> Local Dataset (Enron Emails)
```

## 🚀 Installation & Setup

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** & **npm**

### 1. Backend Setup (Server)

Navigate to the server directory and install Python dependencies:

```bash
cd server
pip install -r requirements.txt
```

**Key Dependencies:**

- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `pandas`: Data manipulation
- `python-multipart`: Form handling

**Start the Server:**

```bash
python -m uvicorn main:app --reload --port 8000
```

*The server will start at `http://localhost:8000`*

### 2. Frontend Setup (Client)

Open a new terminal, navigate to the client directory, and install Node dependencies:

```bash
cd client
npm install
```

**Key Dependencies:**

- `react`, `react-dom`: UI library
- `lucide-react`: Icons
- `react-markdown`: Rendering markdown output
- `vite`: Build tool

**Start the Client:**

```bash
npm run dev
```

*The app will run at `http://localhost:5173`*

## 🛠 Features

1. **Dashboard**: Stats, Charts, and Activity Logs.
2. **New Report**:
    - **Enron Data**: Load random emails from the local dataset for testing.
    - **Generator**: Creates Analysis, BRD, and Clarification Questions (Mock).
3. **Team**: View core team members and roles.
4. **Profile**: Personalized user profile (Satyam Raghuvanshi).

## 📂 Dataset

The project includes the Enron Email Dataset in `dataset/emails.csv`.
The server is configured to load this file automatically on startup.
