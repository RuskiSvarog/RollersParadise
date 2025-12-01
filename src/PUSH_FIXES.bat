@echo off
echo ===================================
echo PUSHING VERCEL BUILD FIXES
echo ===================================
echo.

cd /d C:\Users\avgel\rollers-paradise

echo Adding files...
git add .vercelignore
git add vite.config.ts

echo Committing...
git commit -m "Fix: Exclude Supabase server files from Vercel build"

echo Pushing to GitHub...
git push origin main

echo.
echo ===================================
echo DONE! Now redeploy on Vercel
echo ===================================
pause
