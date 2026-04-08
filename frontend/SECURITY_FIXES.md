Frontend vulnerability remediation steps

1) Backup current lockfile and dependencies:
   - copy package-lock.json package-lock.json.bak

2) Run automatic fixes (may introduce breaking changes):
   - npm install
   - npm audit fix
   - npm audit fix --force   # upgrades can be breaking
   - npm update

3) Recommended manual follow-up:
   - Run the dev server: npm run dev
   - Test core pages and components (login, coding challenges, editor)
   - Run linting: npm run lint
   - If build exists: npm run build && npm run preview
   - If major upgrades caused issues, use package.json to pin compatible versions and reinstall.

4) Optional: Create a Dependabot or Renovate config to keep deps updated automatically in PRs.

Notes:
- Always test after forced upgrades. Keep package-lock backup to revert.
- For CI, run npm ci to reproduce exact installs.
