"""
CLI Runner for Civic Issue Image Detection Microservice
"""
import sys
import argparse
import uvicorn
from app.config import settings

def parse_args():
    parser = argparse.ArgumentParser(description="Start Civic Issue AI Vision Microservice")
    parser.add_argument("--host", type=str, default=settings.host, help="Bind host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=settings.port, help="Bind port (default: 8001)")
    parser.add_argument("--workers", type=int, default=1, help="Worker count")
    parser.add_argument("--reload", action="store_true", help="Enable live auto-reload for development")
    return parser.parse_args()

def main():
    args = parse_args()
    print("=" * 65)
    print(" [VISION AI] STARTING CIVIC ISSUE IMAGE DETECTION & ROUTING MICROSERVICE")
    print(f" URL:     http://{args.host}:{args.port}")
    print(f" Docs:    http://{args.host}:{args.port}/docs")
    print(f" Portal:  http://{args.host}:{args.port}/ui")
    print("=" * 65)

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers
    )

if __name__ == "__main__":
    main()
