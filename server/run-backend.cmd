@echo off
setlocal
if "%JAVA_HOME%"=="" if exist "%USERPROFILE%\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\21\bin\java.exe" set "JAVA_HOME=%USERPROFILE%\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\21"
if not "%JAVA_HOME%"=="" set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0"
call mvnw.cmd spring-boot:run
