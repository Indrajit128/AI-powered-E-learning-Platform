@echo off
REM Run from frontend folder. This will install dependencies, run npm audit fixes (including --force), and update packages.
REM WARNING: --force may apply breaking changes. Test the app after running.

setlocal
echo Backing up package-lock.json if present...
if exist package-lock.json copy /Y package-lock.json package-lock.json.bak

echo Installing dependencies (may take a while)...
npm install

echo Running safe npm audit fix...
npm audit fix

echo Running npm audit fix --force (may upgrade major versions)...
npm audit fix --force

echo Running npm update to update semver-compatible versions...
npm update

echo Audit and updates complete. Please run the dev server and test the app:
echo npm run dev
endlocal
