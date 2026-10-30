FROM python:3.12-slim

WORKDIR /app

# Install minimal runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages (PyTorch CPU wheel for lean container footprint)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy application source code and model configuration files
COPY app/ ./app/
COPY grievance-bert-model/ ./grievance-bert-model/
COPY run_service.py ./

# Environment configuration
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000
ENV MODEL_PATH=/app/grievance-bert-model

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Automatically reads $PORT assigned by Render/Railway/Cloud
CMD ["python", "run_service.py"]

