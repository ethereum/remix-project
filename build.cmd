@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass %~dp0build.ps1 "%*"
