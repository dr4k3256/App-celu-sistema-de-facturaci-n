@echo off
setlocal
echo ==============================================
echo Build APK/AAB - Sistema de facturacion (móvil)
echo ==============================================

REM Comprueba herramientas básicas
where npm >nul 2>&1 || (echo ERROR: npm no encontrado en PATH & exit /b 1)
where java >nul 2>&1 || (echo ERROR: java JDK no encontrado en PATH & exit /b 1)

echo 1/4 - Instalando dependencias (npm install)
call npm install || (echo npm install falló & exit /b 1)

echo 2/4 - Compilando recursos web (npm run build)
call npm run build || (echo npm run build falló & exit /b 1)

echo 3/4 - Sincronizando Capacitor (npx cap sync android)
call npx cap sync android || (echo npx cap sync android falló & exit /b 1)

if not exist android (echo ERROR: carpeta android no encontrada después de npx cap sync & exit /b 1)

echo 4/4 - Ejecutando Gradle para generar release
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
pushd android
if exist gradlew.bat (
    echo Ejecutando gradlew.bat assembleDebug ...
    call gradlew.bat assembleDebug || (echo gradle build falló & popd & exit /b 1)
    echo Build finalizada. Busca los artefactos en android\app\build\outputs\apk\debug
) else (
    echo ERROR: gradlew.bat no encontrado en android\ - abre Android Studio con "npx cap open android" y genera el proyecto nativo allí
    popd
    exit /b 1
)
popd

echo Build completada.
endlocal
exit /b 0
