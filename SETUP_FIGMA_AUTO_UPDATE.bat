@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

title TWYNE Figma Auto Update Setup

set "REPO_URL=https://github.com/nurhannetarek13-design/TWYNE-BOX-3D.git"
set "TARGET=%USERPROFILE%\Documents\TWYNE-FIGMA-LIVE"
set "TASK_NAME=TWYNE Figma Auto Update"
set "GITEXE="

where git >nul 2>&1
if not errorlevel 1 set "GITEXE=git"

if not defined GITEXE (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%~fD\resources\app\git\cmd\git.exe" set "GITEXE=%%~fD\resources\app\git\cmd\git.exe"
  )
)

if not defined GITEXE (
  echo.
  echo TWYNE SETUP NEEDS GIT OR GITHUB DESKTOP.
  echo Install GitHub Desktop, sign in once, then run this file again.
  echo.
  start "" "https://desktop.github.com/download/"
  pause
  exit /b 1
)

echo.
echo ==============================================
echo   TWYNE FIGMA AUTO UPDATE — ONE-TIME SETUP
echo ==============================================
echo.
echo Live folder:
echo %TARGET%
echo.

if exist "%TARGET%\.git" (
  echo Existing TWYNE live folder found. Updating it now...
  "%GITEXE%" -C "%TARGET%" fetch origin main
  if errorlevel 1 goto :auth_error
  "%GITEXE%" -C "%TARGET%" reset --hard origin/main
  if errorlevel 1 goto :sync_error
) else (
  if exist "%TARGET%" (
    echo The target folder already exists but is not a Git clone.
    echo Please rename or remove this folder first:
    echo %TARGET%
    echo.
    pause
    exit /b 1
  )

  echo Cloning the private TWYNE repository...
  echo GitHub may open a browser once for sign-in. Approve it if asked.
  echo.
  "%GITEXE%" clone "%REPO_URL%" "%TARGET%"
  if errorlevel 1 goto :auth_error
)

if not exist "%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd" goto :missing_file
if not exist "%TARGET%\figma-giftset-direct\manifest.json" goto :missing_file

echo.
echo Creating Windows automatic update task...

schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1
schtasks /Create /TN "%TASK_NAME%" /TR "\"%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd\"" /SC MINUTE /MO 5 /F >nul
if errorlevel 1 goto :task_error

call "%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd"

echo.
echo ==============================================
echo   DONE — TWYNE IS NOW AUTO-UPDATING
 echo ==============================================
echo.
echo From now on:
echo 1. I update GitHub.
echo 2. Your computer syncs automatically every 5 minutes.
echo 3. You do NOT download ZIP again.
echo 4. You do NOT import the plugin again.
echo 5. Just re-run the TWYNE plugin in Figma to use the newest version.
echo.
echo IMPORTANT — ONE LAST FIGMA STEP:
echo Import this manifest ONCE from the permanent live folder:
echo %TARGET%\figma-giftset-direct\manifest.json
echo.
echo Opening the exact manifest location now...
explorer.exe /select,"%TARGET%\figma-giftset-direct\manifest.json"
echo.
pause
exit /b 0

:auth_error
echo.
echo GitHub could not sync the private repository.
echo Make sure GitHub Desktop is installed and signed in to the account that owns TWYNE-BOX-3D, then run this setup again.
echo.
pause
exit /b 1

:sync_error
echo.
echo The TWYNE live folder could not be updated.
echo Close any program editing files inside it and run this setup again.
echo.
pause
exit /b 1

:missing_file
echo.
echo Setup downloaded the repository, but the Figma plugin files are missing.
echo Expected:
echo %TARGET%\figma-giftset-direct\manifest.json
echo.
pause
exit /b 1

:task_error
echo.
echo Windows could not create the automatic update task.
echo Right-click this setup file and choose Run as administrator, then try again.
echo.
pause
exit /b 1
