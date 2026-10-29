@echo off
title Civic Issue Vision Microservice
echo ===================================================================
echo  Starting Civic Issue Image Detection Service on Port 8001...
echo ===================================================================
py -3.13 run_service.py --host 0.0.0.0 --port 8001
pause
