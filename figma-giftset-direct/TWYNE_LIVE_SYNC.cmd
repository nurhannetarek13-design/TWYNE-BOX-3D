@echo off
setlocal EnableExtensions
title TWYNE Figma Live Sync

:loop
call "%~dp0AUTO_UPDATE.cmd"
timeout /t 60 /nobreak >nul
goto loop
