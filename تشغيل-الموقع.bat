@echo off
chcp 65001 >nul
title Chemical Engineering Batch 45 - Local Server
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
