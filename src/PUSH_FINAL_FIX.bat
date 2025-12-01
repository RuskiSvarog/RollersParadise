@echo off
echo ===================================
echo PUSHING FINAL VERCEL FIX
echo ===================================
echo.

cd /d C:\Users\avgel\rollers-paradise

echo Adding files...
git add .npmrc
git add vercel.json

echo Committing...
git commit -m "Fix: Add npmrc and update vercel config for proper build"

echo Pushing to GitHub...
git push origin main

echo.
echo ===================================
echo DONE! Vercel will auto-redeploy
echo ===================================
echo.
echo Wait 30 seconds then check Vercel!
pause
