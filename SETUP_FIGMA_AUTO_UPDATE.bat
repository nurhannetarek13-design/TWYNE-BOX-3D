@echo off
setlocal EnableExtensions
title TWYNE Figma Auto Update Setup

set "REPO_URL=https://github.com/nurhannetarek13-design/TWYNE-BOX-3D.git"
set "TARGET=%USERPROFILE%\Documents\TWYNE-FIGMA-LIVE"
set "GITEXE=git"
set "LOG=%TARGET%\figma-giftset-direct\AUTO_UPDATE_LOG.txt"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

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
if not exist "%TARGET%\figma-giftset-direct\TWYNE_LIVE_SYNC.cmd" goto missing_file
if not exist "%TARGET%\figma-giftset-direct\START_TWYNE_SYNC.vbs" goto missing_file

echo.
echo Verifying GitHub sync now...
if exist "%LOG%" del /q "%LOG%"
call "%TARGET%\figma-giftset-direct\AUTO_UPDATE.cmd"
if errorlevel 1 goto verify_error
if not exist "%LOG%" goto verify_error
findstr /C:"SUCCESS - Synced to origin/main" "%LOG%" >nul
if errorlevel 1 goto verify_error

echo Installing hidden auto-start updater...
copy /Y "%TARGET%\figma-giftset-direct\START_TWYNE_SYNC.vbs" "%STARTUP%\TWYNE_FIGMA_AUTO_UPDATE.vbs" >nul
if errorlevel 1 goto startup_error

echo Starting live sync now...
wscript.exe "%STARTUP%\TWYNE_FIGMA_AUTO_UPDATE.vbs"
timeout /t 2 /nobreak >nul

echo.
echo ==============================================
echo DONE - AUTO UPDATE IS VERIFIED AND ACTIVE
echo ==============================================
echo.
echo GitHub changes will sync to this computer every 1 minute.
echo You do NOT need to download ZIP files again.
echo You do NOT need to import the manifest again.
echo Just re-run the TWYNE plugin in Figma after a sync.
echo.
echo Live manifest:
echo %TARGET%\figma-giftset-direct\manifest.json
echo.
echo Update log:
echo %LOG%
echo.
explorer.exe /select,"%TARGET%\figma-giftset-direct\manifest.json"
pause
exit /b 0

:auth_error
echo.
echo GitHub could not clone or update the private repository.
echo Open GitHub Desktop and make sure you are signed in to the account that owns TWYNE-BOX-3D.
pause
exit /b 1

:sync_error
echo.
echo The TWYNE live folder could not be updated.
pause
exit /b 1

:missing_file
echo.
echo The repository downloaded, but one or more updater files are missing.
pause
exit /b 1

:startup_error
echo.
echo Windows could not install the hidden startup updater.
echo Send me a screenshot of this window.
pause
exit /b 1

:verify_error
echo.
echo GitHub sync verification failed.
echo Open this file and send me what it says:
echo %LOG%
echo.
pause
exit /b 1
