@echo off
chcp 65001 >nul
echo ========================================
echo 快速编译微信小程序
echo ========================================
echo.

echo [提示] Sass 警告可以忽略，不影响功能
echo.

echo 开始编译...
call npm run dev:mp-weixin

pause
