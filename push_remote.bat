@echo off
REM Adds GitHub remote (if not present) and runs run_commit.bat to commit & push
setlocal
necho Setting remote to https://github.com/Indrajit128/AI-powered-E-learning-Platform.git
ngit remote remove origin 2>nul
ngit remote add origin https://github.com/Indrajit128/AI-powered-E-learning-Platform.git
nfor /f "usebackq delims=" %%b in (`git rev-parse --abbrev-ref HEAD`) do set BRANCH=%%b
necho Current branch is %BRANCH%
necho Running run_commit.bat (will prompt for credentials if needed)...
ncall run_commit.bat
necho Done.
endlocal
