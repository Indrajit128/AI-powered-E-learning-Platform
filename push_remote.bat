@echo off
REM Adds GitHub remote (if not present) and runs run_commit.bat to commit & push
setlocal
echo Setting remote to https://github.com/Indrajit128/Mentordeskk.git
git remote remove origin 2>nul
git remote add origin https://github.com/Indrajit128/Mentordeskk.git
for /f "usebackq delims=" %%b in (`git rev-parse --abbrev-ref HEAD`) do set BRANCH=%%b
echo Current branch is %BRANCH%
echo Running run_commit.bat (will prompt for credentials if needed)...
call run_commit.bat
echo Done.
endlocal
