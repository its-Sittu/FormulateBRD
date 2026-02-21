# FormulateBRD — The Agentic Business Analyst

[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_Flash-4285F4?style=flat&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

**FormulateBRD** is an AI-powered pipeline designed to bridge the gap between unstructured business communication and structured software requirements. It automates the extraction and formalization of business needs into enterprise-ready **Business Requirements Documents (BRDs)**, reducing ambiguity and accelerating project kick-off.

---

## 🧠 The Agentic Pipeline

FormulateBRD operates on a strict **3-stage analytical workflow** to ensure high-fidelity outputs over creative assumptions.

1. **Requirement Analysis**: The system deconstructs raw input (emails, chats, notes) into factual nodes—Business Problems, Objectives, Stakeholders, and Explicit Requirements—without making guesses.
2. **BRD Generation**: Analysis data is transformed into a formal document using standardized enterprise headers, ensuring consistent formatting and professional language.
3. **Validation & Clarification**: The final stage performs a gap analysis, identifying ambiguities or missing metrics and generating a list of actionable "Clarification Questions" for stakeholders.

---

## ✨ Key Features

- **📊 Operational Dashboard**: Real-time telemetry monitoring generation velocity, AI engine status, and session metrics.
- **📧 Business Simulation**: Integrated with the **Enron Email Dataset** to allow instant testing and demonstration using real-world enterprise communication.
- **🌓 Enterprise UI**: High-density interface with support for **Dark/Light modes**, built using the Inter and Outfit typography systems.
- **📄 Markdown First**: All requirements are generated and rendered in standard Markdown, ready for export or integration into tools like Jira and Confluence.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (Backend)
- **Node.js 18+** & **npm** (Frontend)
- **Gemini API Key** (Optional, falls back to Mock mode)

### 1. Backend Setup (Server)

```bash
cd server
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
echo "GEMINI_API_KEY=your_key_here" > .env

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (Client)

```bash
cd client
# Install dependencies
npm install

# Start development server
npm run dev
```

*Access the dashboard at `http://localhost:5173`.*

---

## 📦 Project Architecture

```text
├── client/          # React + Vite (Dashboard UI & Markdown Rendering)
├── server/          # Python FastAPI (Agentic Pipeline & Enron Logic)
├── dataset/         # Local Data (Enron Email Sample)
└── README.md        # Documentation
```

---

## 👥 The Team

- **Satyam Raghuvanshi**: Backend & AI Integration Lead
- **Saksham Jaiswal**: UX & Product Delivery Lead
- **Sittu Kumar Singh**: Frontend Architect
- **Shimant Ranjan**: Requirement Specialist

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
