# Stage 1: Build the React Frontend
FROM node:18-alpine AS build-stage
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Pass environment variable for build time
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Build the Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy dataset and server source
COPY dataset/ ./dataset/
COPY server/ ./
# Copy the frontend build from stage 1
COPY --from=build-stage /app/client/dist ./client/dist

# Expose the port (FastAPI default or Railway provided)
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Start command
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
