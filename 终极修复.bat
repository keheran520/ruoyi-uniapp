@echo off
chcp 65001 >nul
echo ========================================
echo 终极修复 - 彻底清理所有缓存
echo ========================================
echo.

echo 请先关闭微信开发者工具！
echo.
pause

echo.
echo [1/6] 删除 dist 目录...
if exist "dist" (
    rd /s /q "dist"
    echo ✓ 已删除 dist
)

echo.
echo [2/6] 删除 node_modules 缓存...
if exist "node_modules\.vite" rd /s /q "node_modules\.vite"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache"
echo ✓ 已删除 node_modules 缓存

echo.
echo [3/6] 删除 uni-app 缓存...
if exist ".hbuilderx" rd /s /q ".hbuilderx"
if exist ".temp" rd /s /q ".temp"
if exist ".uni" rd /s /q ".uni"
echo ✓ 已删除 uni-app 缓存

echo.
echo [4/6] 删除微信开发者工具缓存...
set WECHAT_CACHE=%LOCALAPPDATA%\微信开发者工具\User Data\Default\WeappFileSystem
if exist "%WECHAT_CACHE%" (
    rd /s /q "%WECHAT_CACHE%"
    echo ✓ 已删除微信开发者工具缓存
) else (
    echo ✓ 微信开发者工具缓存不存在
)

echo.
echo [5/6] 等待5秒...
timeout /t 5 /nobreak >nul

echo.
echo [6/6] 开始编译...
call npm run dev:mp-weixin

echo.
echo ========================================
echo 编译完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 打开微信开发者工具
echo 2. 重新导入项目目录
echo 3. 如果还有错误，点击"工具" → "清缓存" → "全部清除"
echo.
pause
