@echo off
echo ===================================
echo PUSHING ALL FILES TO NEW REPOSITORY
echo ===================================
echo.

cd /d C:\Users\avgel\rollers-paradise

echo Step 1: Aborting any stuck git operations...
git rebase --abort 2>nul
git cherry-pick --abort 2>nul
git merge --abort 2>nul
echo Git operations cleared

echo.
echo Step 2: Removing old git folder completely...
if exist .git (
    rmdir /s /q .git
    echo Old .git removed
)

echo.
echo Step 3: Initializing fresh git repository...
git init

echo.
echo Step 4: Adding all files...
git add .

echo.
echo Step 5: Creating initial commit...
git commit -m "Initial commit: Complete Rollers Paradise game with all features"

echo.
echo Step 6: Renaming branch to main...
git branch -M main

echo.
echo Step 7: Adding remote repository...
git remote add origin https://github.com/RuskiSvarog/RollersParadise.git

echo.
echo Step 8: Pushing to GitHub (with force to overwrite)...
git push -u origin main --force

echo.
echo ===================================
echo DONE! All files pushed to GitHub!
echo ===================================
echo.
echo Next: Go to Vercel and import RuskiSvarog/RollersParadise
echo.
pause