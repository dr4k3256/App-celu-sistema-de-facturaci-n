@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set JAVA_BIN=C:\Program Files\Android\Android Studio\jbr\bin
set PATH=%JAVA_BIN%;%PATH%
set KEYSTORE=facturador.jks
set ALIAS=facturador
set PASS=Facturador123
set BUILD_TOOLS=C:\Users\brandon\AppData\Local\Android\Sdk\build-tools\34.0.0

echo === PASO 1: Limpiando archivos anteriores ===
if exist Facturador_Release.aab del /F Facturador_Release.aab

echo === PASO 2: Compilando Web ===
call npm run build
if %errorlevel% neq 0 (echo ERROR en npm build & exit /b %errorlevel%)

echo === PASO 3: Sincronizando Capacitor ===
call npx cap sync android
if %errorlevel% neq 0 (echo ERROR en cap sync & exit /b %errorlevel%)

echo === PASO 4: Ensamblando AAB de Release ===
cd android
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (echo ERROR en gradle & cd .. & exit /b %errorlevel%)
cd ..

set AAB_PATH=android\app\build\outputs\bundle\release\app-release.aab

echo === PASO 5: Firmando AAB con jarsigner ===
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "%KEYSTORE%" -storepass %PASS% -keypass %PASS% "%AAB_PATH%" "%ALIAS%"
if %errorlevel% neq 0 (echo ERROR en jarsigner & exit /b %errorlevel%)

echo === PASO 6: Copiando al Escritorio ===
powershell -Command "Copy-Item -Path '%AAB_PATH%' -Destination 'C:\Users\brandon\Desktop\Facturador_Release.aab' -Force"

echo.
echo ============================================
echo    BUILD EXITOSO! AAB en el Escritorio
echo ============================================
