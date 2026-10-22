# ==============================================================================
# Baskly.money - Spring Boot Backend Launcher
# Automatically configures JDK 21 and starts the backend service on port 8080
# ==============================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $scriptDir "server"

# Auto-detect JDK 21
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $vscodeJdk = "$env:USERPROFILE\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\21"
    $programFilesJdk = "C:\Program Files\Java\jdk-21"
    if (Test-Path "$vscodeJdk\bin\java.exe") {
        $env:JAVA_HOME = $vscodeJdk
    } elseif (Test-Path "$programFilesJdk\bin\java.exe") {
        $env:JAVA_HOME = $programFilesJdk
    }
}

if ($env:JAVA_HOME) {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting Baskly.money Spring Boot API   " -ForegroundColor Green
Write-Host "  Port:      8080                         " -ForegroundColor Yellow
Write-Host "  Java Home: $env:JAVA_HOME               " -ForegroundColor DarkGray
Write-Host "  Directory: $serverDir                   " -ForegroundColor DarkGray
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location $serverDir
& ".\mvnw.cmd" spring-boot:run
