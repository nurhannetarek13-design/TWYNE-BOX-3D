@echo off
setlocal EnableExtensions

set "ROOT=%~dp0.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"
set "LOG=%ROOT%\figma-giftset-direct\AUTO_UPDATE_LOG.txt"
set "GITEXE="

echo [%date% %time%] START >> "%LOG%"

where git >nul 2>&1
if not errorlevel 1 set "GITEXE=git"

if not defined GITEXE (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%~fD\resources\app\git\cmd\git.exe" set "GITEXE=%%~fD\resources\app\git\cmd\git.exe"
  )
)

if not defined GITEXE (
  echo [%date% %time%] ERROR - Git not found >> "%LOG%"
  exit /b 1
)

if not exist "%ROOT%\.git" (
  echo [%date% %time%] ERROR - Live folder is not a Git clone >> "%LOG%"
  exit /b 1
)

"%GITEXE%" -C "%ROOT%" fetch -q origin main >> "%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR - Fetch failed >> "%LOG%"
  exit /b 1
)

"%GITEXE%" -C "%ROOT%" reset --hard origin/main >> "%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR - Reset failed >> "%LOG%"
  exit /b 1
)

echo [%date% %time%] SUCCESS - Synced to origin/main >> "%LOG%"
exit /b 0
