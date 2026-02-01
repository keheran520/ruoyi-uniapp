@echo off
chcp 65001 >nul
echo ========================================
echo 清理缓存并重新编译
echo ========================================
echo.

echo [1/3] 清理编译缓存...
if exist "dist\dev\mp-weixin" rd /s /q "dist\dev\mp-weixin"
if exist "node_modules\.vite" rd /s /q "node_modules\.vite"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache"
echo ✓ 缓存已清理

echo.
echo [2/3] 等待3秒...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 开始编译...
call npm run dev:mp-weixin

pause
