$ErrorActionPreference = "Stop"

if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $vscodeJdk = "$env:USERPROFILE\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\21"
    if (Test-Path "$vscodeJdk\bin\java.exe") {
        $env:JAVA_HOME = $vscodeJdk
    }
}

if ($env:JAVA_HOME) {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $serverDir
& ".\mvnw.cmd" spring-boot:run
