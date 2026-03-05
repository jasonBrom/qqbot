@echo off
REM Local shim for environments where npm is unavailable in PATH during plugin install.
REM This plugin is self-contained at runtime and does not require dependency installation.
echo [qqbot] npm shim: skip "%*"
exit /b 0
