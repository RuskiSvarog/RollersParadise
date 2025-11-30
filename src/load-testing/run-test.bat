@echo off
REM ============================================================
REM ROLLERS PARADISE - LOAD TEST RUNNER (Windows)
REM ============================================================
REM Developer: Ruski (avgelatt@gmail.com, 913-213-8666)
REM Quick script to run load tests with credentials pre-configured
REM ============================================================

set SUPABASE_PROJECT_ID=kckprtabirvtmhehnczg
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE

echo.
echo ========================================
echo    ROLLERS PARADISE LOAD TESTING
echo ========================================
echo.
echo Available tests:
echo   1) Simple Test (50 players, 5 min) - START HERE
echo   2) Realistic Load (500 players, 15 min)
echo   3) Stress Test (1000 players, 20 min)
echo   4) SSE Connection Test (100 SSE connections)
echo.
set /p choice="Which test would you like to run? (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running Simple Test...
    echo Open dashboard at: https://kckprtabirvtmhehnczg.supabase.co?loadtest=true
    echo.
    artillery run load-testing/simple-test.yml
) else if "%choice%"=="2" (
    echo.
    echo Running Realistic Load Test...
    echo This will take 15 minutes
    echo Open dashboard at: https://kckprtabirvtmhehnczg.supabase.co?loadtest=true
    echo.
    artillery run load-testing/artillery-config.yml
) else if "%choice%"=="3" (
    echo.
    echo Running Stress Test...
    echo This will take 20 minutes and WILL push your system to breaking point
    echo.
    set /p confirm="Are you sure? (yes/no): "
    if "%confirm%"=="yes" (
        artillery run load-testing/stress-test.yml
    ) else (
        echo Cancelled.
    )
) else if "%choice%"=="4" (
    echo.
    echo Running SSE Connection Test...
    echo Open dashboard at: https://kckprtabirvtmhehnczg.supabase.co?loadtest=true
    echo.
    artillery run load-testing/sse-test.yml
) else (
    echo Invalid choice. Exiting.
    exit /b 1
)

echo.
echo Test complete!
echo.
echo View detailed results in your dashboard
echo To generate HTML report, run:
echo   artillery run load-testing/simple-test.yml --output report.json
echo   artillery report report.json --output report.html
