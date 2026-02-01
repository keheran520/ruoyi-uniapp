@echo off
chcp 65001 >nul
echo ========================================
echo 清理并重新编译微信小程序
echo ========================================
echo.

echo [1/4] 清理旧的编译文件...
if exist "dist\dev\mp-weixin" (
    rd /s /q "dist\dev\mp-weixin"
    echo ✓ 已删除 dist\dev\mp-weixin
) else (
    echo ✓ 目录不存在，跳过
)

if exist "dist\build\mp-weixin" (
    rd /s /q "dist\build\mp-weixin"
    echo ✓ 已删除 dist\build\mp-weixin
) else (
    echo ✓ 目录不存在，跳过
)

echo.
echo [2/4] 清理 node_modules 缓存...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo ✓ 已删除 .vite 缓存
)

if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache"
    echo ✓ 已删除 .cache 缓存
)

echo.
echo [3/4] 清理 uni-app 缓存...
if exist ".hbuilderx" (
    rd /s /q ".hbuilderx"
    echo ✓ 已删除 .hbuilderx 缓存
)

echo.
echo [4/4] 开始编译微信小程序...
echo ----------------------------------------
echo 提示：Sass 弃用警告可以忽略，不影响编译
echo ----------------------------------------
echo.

call npm run dev:mp-weixin

echo.
echo ========================================
echo 编译完成！
echo ========================================
echo.
echo 请在微信开发者工具中打开以下目录：
echo %cd%\dist\dev\mp-weixin
echo.
pause
