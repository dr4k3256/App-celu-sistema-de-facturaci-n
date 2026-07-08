set BUILD_TOOLS=C:\Users\brandon\AppData\Local\Android\Sdk\build-tools\34.0.0
"%BUILD_TOOLS%\zipalign.exe" -f -v -p 4 "android\app\build\outputs\apk\release\app-release-unsigned.apk" "app-aligned.apk"
"%BUILD_TOOLS%\apksigner.bat" sign --ks "facturador.jks" --ks-pass pass:"Facturador123" --ks-key-alias "facturador" --key-pass pass:"Facturador123" --out "Facturador_Release.apk" "app-aligned.apk"
copy "Facturador_Release.apk" "..\..\Facturador_Release.apk" /Y
