@echo off
chcp 65001 >nul
title Chemical Engineering Batch 45 - Share on LAN
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-lan.ps1"
