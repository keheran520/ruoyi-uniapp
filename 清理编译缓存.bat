@echo off
echo 正在清理编译缓存...
echo.

REM 关闭可能占用文件的进程提示
echo 请先关闭微信开发者工具，然后按任意键继续...
pause > nul

REM 删除dist目录
if exist "dist" (
    echo 正在删除 dist 目录...
    rd /s /q "dist"
    if exist "dist" (
        echo 删除失败，请手动删除 dist 目录
    ) else (
        echo dist 目录已删除
    )
) else (
    echo dist 目录不存在
)

REM 删除node_modules/.vite目录
if exist "node_modules\.vite" (
    echo 正在删除 node_modules\.vite 目录...
    rd /s /q "node_modules\.vite"
    echo node_modules\.vite 目录已删除
)

REM 删除node_modules/.cache目录
if exist "node_modules\.cache" (
    echo 正在删除 node_modules\.cache 目录...
    rd /s /q "node_modules\.cache"
    echo node_modules\.cache 目录已删除
)

echo.
echo 清理完成！
echo 现在可以重新编译项目了
echo.
pause
