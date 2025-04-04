@echo off
echo This script must be run as Administrator
echo Right-click on this file and select "Run as administrator"

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as Administrator
    pause
    exit /b 1
)

:: Hosts file location
set HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts

echo Adding custom DNS entries to %HOSTS_FILE%...

:: Add entries to hosts file if they don't exist
findstr /c:"127.0.0.1 admin.esd.local" %HOSTS_FILE% >nul
if errorlevel 1 (
    echo 127.0.0.1 admin.esd.local >> %HOSTS_FILE%
    echo Added: 127.0.0.1 admin.esd.local
) else (
    echo Entry already exists: 127.0.0.1 admin.esd.local
)

findstr /c:"127.0.0.1 customer.esd.local" %HOSTS_FILE% >nul
if errorlevel 1 (
    echo 127.0.0.1 customer.esd.local >> %HOSTS_FILE%
    echo Added: 127.0.0.1 customer.esd.local
) else (
    echo Entry already exists: 127.0.0.1 customer.esd.local
)

findstr /c:"127.0.0.1 driver.esd.local" %HOSTS_FILE% >nul
if errorlevel 1 (
    echo 127.0.0.1 driver.esd.local >> %HOSTS_FILE%
    echo Added: 127.0.0.1 driver.esd.local
) else (
    echo Entry already exists: 127.0.0.1 driver.esd.local
)

findstr /c:"127.0.0.1 api.esd.local" %HOSTS_FILE% >nul
if errorlevel 1 (
    echo 127.0.0.1 api.esd.local >> %HOSTS_FILE%
    echo Added: 127.0.0.1 api.esd.local
) else (
    echo Entry already exists: 127.0.0.1 api.esd.local
)

findstr /c:"127.0.0.1 temporal.esd.local" %HOSTS_FILE% >nul
if errorlevel 1 (
    echo 127.0.0.1 temporal.esd.local >> %HOSTS_FILE%
    echo Added: 127.0.0.1 temporal.esd.local
) else (
    echo Entry already exists: 127.0.0.1 temporal.esd.local
)

echo Done. Custom DNS entries have been added.

:: Flush DNS cache
echo Flushing DNS cache...
ipconfig /flushdns
echo DNS cache flushed.

pause 