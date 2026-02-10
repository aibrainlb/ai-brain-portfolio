@echo off
echo ========================================
echo Project Files Verification
echo ========================================
echo.
echo Checking your project root directory...
echo Current directory: %CD%
echo.

echo Files in root directory:
dir /b *.js *.json
echo.

echo Checking for required files:
echo.

if exist "server.js" (
    echo [✓] server.js - FOUND
) else (
    echo [✗] server.js - MISSING ^(THIS IS THE PROBLEM!^)
)

if exist "package.json" (
    echo [✓] package.json - FOUND
) else (
    echo [✗] package.json - MISSING
)

if exist ".env" (
    echo [✓] .env - FOUND
) else if exist "_env" (
    echo [~] _env found (needs to be renamed to .env)
) else (
    echo [✗] .env - MISSING
)

echo.
echo Checking folders:
echo.

if exist "config" (
    echo [✓] config\ - FOUND
) else (
    echo [✗] config\ - MISSING
)

if exist "models" (
    echo [✓] models\ - FOUND
) else (
    echo [✗] models\ - MISSING
)

if exist "routes" (
    echo [✓] routes\ - FOUND
) else (
    echo [✗] routes\ - MISSING
)

if exist "public" (
    echo [✓] public\ - FOUND
) else (
    echo [✗] public\ - MISSING
)

echo.
echo ========================================
echo.
echo All .js files in your project root:
dir /b *.js 2>nul || echo No .js files found in root!
echo.
echo ========================================
echo.

if not exist "server.js" (
    echo.
    echo *** PROBLEM IDENTIFIED ***
    echo server.js is missing from your project root!
    echo.
    echo SOLUTION:
    echo 1. Download server.js from the files I provided
    echo 2. Save it to: %CD%\server.js
    echo 3. Run: npm start
    echo.
)

pause