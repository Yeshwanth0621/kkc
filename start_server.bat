@echo off
echo Starting BookTopia Local Server...
echo.
echo IMPORTANT: access the site at http://localhost:8000
echo Do NOT close this window while using the app.
echo.
python -m http.server 8000
pause
