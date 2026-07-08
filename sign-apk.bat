@echo off
set BUILD_TOOLS=C:\Users\brandon\AppData\Local\Android\Sdk\build-tools\37.0.0
set APK_PATH=android\app\build\outputs\apk\release\app-release-unsigned.apk
set ALIGNED_APK=android\app\build\outputs\apk\release\app-release-aligned.apk
set KEYSTORE=facturador.jks
set ALIAS=facturador
set PASS=Facturador123

echo Alineando el APK (Zipalign)...
"%BUILD_TOOLS%\zipalign.exe" -f -v 4 "%APK_PATH%" "%ALIGNED_APK%"

echo Firmando con apksigner (V2/V3)...
call "%BUILD_TOOLS%\apksigner.bat" sign --ks "%KEYSTORE%" --ks-pass pass:%PASS% "%ALIGNED_APK%"

echo Moviendo al escritorio...
copy "%ALIGNED_APK%" "..\..\Facturador_Release.apk" /Y

echo Listo!
