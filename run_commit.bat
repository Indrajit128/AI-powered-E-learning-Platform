@echo off
REM Stages seed changes and TODO, commits with co-author, and pushes current branch
setlocal
necho Staging files...
git add server\db\seeds\coding_questions.json TODO.md
necho Committing...
git commit -m "chore(seeds): add DSA challenges for LinkedList, Graph, Searching, Sorting, Hashing, Greedy

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" || (
  echo Commit failed or nothing to commit.
  git --no-pager status --porcelain
  exit /b 1
)
for /f "usebackq delims=" %%b in (`git rev-parse --abbrev-ref HEAD`) do set BRANCH=%%b
echo Pushing to origin/%BRANCH%...
git push origin %BRANCH%
echo Done.
endlocal
