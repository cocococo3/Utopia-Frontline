@echo off
setlocal
set "ROOT=%~dp0"

where tweego >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "TWEEGO=tweego"
) else (
    set "TWEEGO=D:\tweego-2.1.1-windows-x64\tweego.exe"
)

"%TWEEGO%" -f sugarcube-2 -o "%ROOT%dist\story.html" "%ROOT%src\story" "%ROOT%src\assets\js" "%ROOT%src\assets\css"

echo Done!
pause