@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "API_PROJECT=%BACKEND_DIR%\src\Hutchison.Leave.Api\Hutchison.Leave.Api.csproj"
set "DOTNET_LOCAL_DIR=%ROOT%.dotnet"
set "DOTNET_LOCAL_EXE=%DOTNET_LOCAL_DIR%\dotnet.exe"
set "DOTNET_EXE="
set "FRONTEND_CMD=cd /d ""%FRONTEND_DIR%"" && if not exist node_modules (npm install) && npm run dev"

if /I "%~1"=="--check" goto :check
if /I "%~1"=="--frontend-only" goto :frontend_only

if not exist "%API_PROJECT%" (
  echo [ERROR] Backend API project not found: "%API_PROJECT%"
  exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERROR] Frontend package.json not found: "%FRONTEND_DIR%\package.json"
  exit /b 1
)

call :ensure_dotnet
if errorlevel 1 exit /b 1

echo Starting backend API in a new window...
start "Hutchison eLeave API" cmd /k "set PATH=%DOTNET_LOCAL_DIR%;%%PATH%% && cd /d ""%BACKEND_DIR%"" && ""%DOTNET_EXE%"" run --project ""%API_PROJECT%"""

echo Starting frontend dev server in a new window...
start "Hutchison eLeave Frontend" cmd /k "%FRONTEND_CMD%"

echo Done. Two windows should now be running.
exit /b 0

:frontend_only
echo Starting frontend dev server in a new window...
start "Hutchison eLeave Frontend" cmd /k "%FRONTEND_CMD%"
echo Frontend start command launched.
exit /b 0

:check
call :detect_dotnet
echo [OK] Batch file syntax and required paths are valid.
echo Root: %ROOT%
echo Backend: %BACKEND_DIR%
echo Frontend: %FRONTEND_DIR%
if defined DOTNET_EXE (
  echo dotnet: %DOTNET_EXE%
) else (
  echo dotnet: not found yet ^(will auto-install to "%DOTNET_LOCAL_DIR%" on first run^)
)
exit /b 0

:detect_dotnet
if exist "%DOTNET_LOCAL_EXE%" (
  set "DOTNET_EXE=%DOTNET_LOCAL_EXE%"
  goto :eof
)

where dotnet >nul 2>&1
if %errorlevel%==0 (
  set "DOTNET_EXE=dotnet"
)
goto :eof

:ensure_dotnet
call :detect_dotnet
if defined DOTNET_EXE goto :eof

echo [INFO] dotnet not found. Installing a local .NET SDK to "%DOTNET_LOCAL_DIR%" ^(no admin required^)...
set "INSTALL_SCRIPT=%TEMP%\dotnet-install.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing https://dot.net/v1/dotnet-install.ps1 -OutFile '%INSTALL_SCRIPT%'"
if errorlevel 1 (
  echo [ERROR] Failed to download dotnet-install script.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_SCRIPT%" -Channel 8.0 -InstallDir "%DOTNET_LOCAL_DIR%" -NoPath
if errorlevel 1 (
  echo [ERROR] Local .NET SDK installation failed.
  exit /b 1
)

if not exist "%DOTNET_LOCAL_EXE%" (
  echo [ERROR] dotnet.exe was not found after installation.
  exit /b 1
)

set "DOTNET_EXE=%DOTNET_LOCAL_EXE%"
echo [OK] Local .NET SDK installed.
goto :eof

