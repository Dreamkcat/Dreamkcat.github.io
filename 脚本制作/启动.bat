@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel%==0 (
  python "%~dp0server.py"
  exit /b
)

where py >nul 2>&1
if %errorlevel%==0 (
  py "%~dp0server.py"
  exit /b
)

echo 未检测到 Python，将直接打开网页（保存项目会下载到浏览器默认下载目录）
start "" "%~dp0index.html"
