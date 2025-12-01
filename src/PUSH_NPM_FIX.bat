@echo off
echo ===================================
echo PUSHING NPM IGNORE FIXES
echo ===================================
echo.

cd /d C:\Users\avgel\rollers-paradise

echo Creating .vercelignore file...
(
echo # Exclude Supabase server functions from Vercel build
echo supabase/
echo api/
echo.
echo # Exclude docs
echo *.md
echo docs/
echo load-testing/
echo.
echo # Exclude scripts
echo *.bat
echo *.sh
echo *.sql
) > .vercelignore

echo Creating .npmignore file...
(
echo # Exclude server-side code from npm
echo supabase/
echo api/
echo *.md
echo docs/
echo load-testing/
echo *.bat
echo *.sh
echo *.sql
) > .npmignore

echo Updating .npmrc file...
(
echo # Prevent npm from trying to install node: built-ins
echo legacy-peer-deps=true
) > .npmrc

echo Adding files...
git add .vercelignore .npmignore .npmrc

echo Committing...
git commit -m "Fix: Add npmignore and vercelignore to exclude server code from npm scan"

echo Pushing to GitHub...
git push origin main

echo.
echo ===================================
echo DONE! Check Vercel in 30 seconds
echo ===================================
pause
