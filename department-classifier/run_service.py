"""
Grievance Department Classifier - Service Runner
Runs the FastAPI web service using Uvicorn.
"""
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import sys
import argparse
import uvicorn

def main():
    parser = argparse.ArgumentParser(description="Start Grievance Classifier Service")
    parser.add_argument("--host", default=os.getenv("HOST", "0.0.0.0"), help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "8000")), help="Port number (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes (default: 1)")
    args = parser.parse_args()

    print("=" * 65)
    print("   CITIZEN GRIEVANCE DEPARTMENT CLASSIFIER - REST API SERVICE")
    print("=" * 65)
    print(f" * Service URL:    http://{args.host if args.host != '0.0.0.0' else 'localhost'}:{args.port}")
    print(f" * Interactive UI: http://localhost:{args.port}/ui")
    print(f" * Swagger Docs:   http://localhost:{args.port}/docs")
    print(f" * Health Endpoint:http://localhost:{args.port}/health")
    print(f" * Model Path:     {os.getenv('MODEL_PATH', './grievance-bert-model')}")
    print("=" * 65)

    uvicorn.run(
        "app.api:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers,
        access_log=True
    )

if __name__ == "__main__":
    main()
