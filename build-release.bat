@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set JAVA_BIN=C:\Program Files\Android\Android Studio\jbr\bin
set KEYSTORE=facturador.jks
set ALIAS=facturador
set PASS=Facturador123
set BUILD_TOOLS=C:\Users\brandon\AppData\Local\Android\Sdk\build-tools\34.0.0

echo === PASO 1: Limpiando archivos anteriores ===
if exist app-aligned.apk del /F app-aligned.apk
if exist Facturador_Release.apk del /F Facturador_Release.apk

echo === PASO 2: Compilando Web ===
call npm run build
if %errorlevel% neq 0 (echo ERROR en npm build & exit /b %errorlevel%)

echo === PASO 3: Sincronizando Capacitor ===
call npx cap sync android
if %errorlevel% neq 0 (echo ERROR en cap sync & exit /b %errorlevel%)

echo === PASO 4: Ensamblando APK de Release ===
cd android
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (echo ERROR en gradle & cd .. & exit /b %errorlevel%)
cd ..

set APK_PATH=android\app\build\outputs\apk\release\app-release-unsigned.apk

echo === PASO 5: Alineando APK ===
"%BUILD_TOOLS%\zipalign.exe" -f -v -p 4 "%APK_PATH%" "app-aligned.apk"
if %errorlevel% neq 0 (echo ERROR en zipalign & exit /b %errorlevel%)

echo === PASO 6: Firmando APK con apksigner ===
"%BUILD_TOOLS%\apksigner.bat" sign --ks "%KEYSTORE%" --ks-pass pass:%PASS% --ks-key-alias "%ALIAS%" --key-pass pass:%PASS% --out "Facturador_Release.apk" "app-aligned.apk"
if %errorlevel% neq 0 (echo ERROR en apksigner & exit /b %errorlevel%)

del "app-aligned.apk"

echo === PASO 7: Verificando firma ===
"%BUILD_TOOLS%\apksigner.bat" verify "Facturador_Release.apk"
if %errorlevel% neq 0 (echo ERROR: APK no paso verificacion & exit /b %errorlevel%)

echo === PASO 8: Copiando al Escritorio ===
powershell -Command "Copy-Item -Path 'Facturador_Release.apk' -Destination 'C:\Users\brandon\Desktop\Facturador_Release.apk' -Force"

echo.
echo ============================================
echo    BUILD EXITOSO! APK en el Escritorio
echo ============================================
