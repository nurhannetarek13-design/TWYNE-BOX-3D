@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"
set "GITEXE="

where git >nul 2>&1
if not errorlevel 1 set "GITEXE=git"

if not defined GITEXE (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%~fD\resources\app\git\cmd\git.exe" set "GITEXE=%%~fD\resources\app\git\cmd\git.exe"
  )
)

if not defined GITEXE exit /b 1
if not exist "%ROOT%\.git" exit /b 1

"%GITEXE%" -C "%ROOT%" fetch -q origin main
if errorlevel 1 exit /b 1

"%GITEXE%" -C "%ROOT%" reset --hard origin/main >nul 2>&1
if errorlevel 1 exit /b 1

exit /b 0
