@echo off
setlocal EnableExtensions
title TWYNE Figma Auto Update Setup

set "REPO_URL=https://github.com/nurhannetarek13-design/TWYNE-BOX-3D.git"
set "TARGET=%USERPROFILE%\Documents\TWYNE-FIGMA-LIVE"
set "TASK_NAME=TWYNE Figma Auto Update"
set "GITEXE=git"

where git >nul 2>&1
if not errorlevel 1 goto git_ready

set "GITEXE="
for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do if exist "%%~fD\resources\app\git\cmd\git.exe" set "GITEXE=%%~fD\resources\app\git\cmd\git.exe"
if defined GITEXE goto git_ready

echo.
echo Git or GitHub Desktop is required.
echo Install GitHub Desktop, sign in, then run this file again.
start "" "https://desktop.github.com/download/"
pause
exit /b 1

:git_ready
echo.
echo ==============================================
echo TWYNE FIGMA AUTO UPDATE SETUP
echo ==============================================
echo.

if exist "%TARGET%\.git" goto update_existing

if exist "%TARGET%" (
  echo Removing the incomplete TWYNE live folder from the previous attempt...
  rmdir /s /q "%TARGET%"
)

echo Cloning TWYNE to:
echo %TARGET%
echo.
"%GITEXE%" clone "%REPO_URL%" "%TARGET%"
if errorlevel 1 goto auth_error
goto after_sync

:update_existing
echo Updating existing TWYNE live folder...
"%GITEXE%" -C "%TARGET%" fetch origin main
if errorlevel 1 goto auth_error
"%GITEXE%" -C "%TARGET%" reset --hard origin/main
if errorlevel 1 goto sync_error

:after_sync
if not exist "%TARGET%\figma-giftset-direct\manifest.json" goto missing_file
if not exist "%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd" goto missing_file

echo.
echo Creating automatic update task every 5 minutes...
schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1
schtasks /Create /TN "%TASK_NAME%" /TR "\"%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd\"" /SC MINUTE /MO 5 /F
if errorlevel 1 goto task_error

call "%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd"

echo.
echo ==============================================
echo DONE - AUTO UPDATE IS ACTIVE
echo ==============================================
echo.
echo You will not need to download ZIP files again.
echo GitHub changes will sync to this computer every 5 minutes.
echo.
echo ONE LAST FIGMA STEP:
echo Import this manifest once from the permanent live folder:
echo %TARGET%\figma-giftset-direct\manifest.json
echo.
echo Opening that file location now...
explorer.exe /select,"%TARGET%\figma-giftset-direct\manifest.json"
echo.
pause
exit /b 0

:auth_error
echo.
echo GitHub could not clone or update the private repository.
echo Open GitHub Desktop and make sure you are signed in to the account that owns TWYNE-BOX-3D.
echo Then run this setup file again.
pause
exit /b 1

:sync_error
echo.
echo The TWYNE live folder could not be updated.
pause
exit /b 1

:missing_file
echo.
echo The repository downloaded, but the Figma plugin files are missing.
pause
exit /b 1

:task_error
echo.
echo Windows could not create the automatic update task.
echo Right-click this setup file and choose Run as administrator, then try again.
pause
exit /b 1
