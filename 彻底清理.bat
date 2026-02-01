@echo off
chcp 65001 >nul
echo ========================================
echo 彻底清理所有缓存和编译文件
echo ========================================
echo.

echo [1/5] 删除 dist 目录...
if exist "dist" (
    rd /s /q "dist"
    echo ✓ 已删除 dist
) else (
    echo ✓ dist 不存在
)

echo.
echo [2/5] 删除 node_modules 缓存...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo ✓ 已删除 .vite
)
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache"
    echo ✓ 已删除 .cache
)

echo.
echo [3/5] 删除 uni-app 缓存...
if exist ".hbuilderx" (
    rd /s /q ".hbuilderx"
    echo ✓ 已删除 .hbuilderx
)

echo.
echo [4/5] 删除临时文件...
if exist ".temp" rd /s /q ".temp"
if exist ".uni" rd /s /q ".uni"
echo ✓ 临时文件已清理

echo.
echo [5/5] 等待5秒后开始编译...
timeout /t 5 /nobreak >nul

echo.
echo 开始编译微信小程序...
call npm run dev:mp-weixin

pause
