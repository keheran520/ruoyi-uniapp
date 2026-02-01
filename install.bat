@echo off
chcp 65001 >nul
echo ========================================
echo 移动端项目依赖重新安装
echo ========================================

echo.
echo [1/4] 删除旧的依赖...
if exist node_modules (
    echo 正在删除 node_modules...
    rd /s /q node_modules
    echo ✓ 已删除 node_modules
) else (
    echo ✓ node_modules 不存在，跳过
)

if exist package-lock.json (
    echo 正在删除 package-lock.json...
    del package-lock.json
    echo ✓ 已删除 package-lock.json
) else (
    echo ✓ package-lock.json 不存在，跳过
)

echo.
echo [2/4] 清理 npm 缓存...
call npm cache clean --force
echo ✓ 缓存已清理

echo.
echo [3/4] 安装依赖 (这可能需要几分钟)...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ✗ 安装失败！请检查网络连接或尝试使用淘宝镜像:
    echo   npm config set registry https://registry.npmmirror.com
    pause
    exit /b 1
)
echo ✓ 依赖安装完成

echo.
echo [4/4] 验证安装...
if exist node_modules\pinia (
    echo ✓ Pinia 已安装
) else (
    echo ✗ Pinia 安装失败
)

if exist node_modules\uview-plus (
    echo ✓ uview-plus 已安装
) else (
    echo ✗ uview-plus 安装失败
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 可以使用以下命令运行项目:
echo   npm run dev:h5          - H5 开发模式
echo   npm run dev:mp-weixin   - 微信小程序开发模式
echo   npm run dev:app         - App 开发模式
echo.
echo 如果遇到问题，请查看 TROUBLESHOOTING.md
echo ========================================
echo.

pause
