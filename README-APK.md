# Generar APK/AAB para Android — Sistema de facturación (móvil)

Resumen rápido
- Esta carpeta contiene la versión móvil lista para producir un APK/AAB usando Capacitor + Android.
- La app no utiliza servicios de analítica ni recolección remota; los datos se almacenan localmente (LocalStorage / SQLite).

Requisitos
- Node.js (>=16), npm
- Java JDK (11+)
- Android Studio + SDK (Android 11+ recomendados)
- Capacitor CLI instalado (v6.x según package.json)

Antes de construir
1. Instala dependencias:

```bash
npm install
```

2. Compilar los recursos web (Vite):

```bash
npm run build
```

3. Sincronizar con Capacitor y plugins nativos:

```bash
npx cap sync android
```

Probar en un emulador o dispositivo
1. Abrir Android Studio en la carpeta `android` generada por Capacitor:

```bash
npx cap open android
```

2. Desde Android Studio ejecuta en emulador o dispositivo físico (Run).

Generar un archivo firmado (AAB recomendable para Play Store)
Opción (Android Studio - GUI):
- Build > Generate Signed Bundle / APK > Android App Bundle
- Sigue el asistente, selecciona o crea un `keystore` (archivo .jks), configura alias, contraseñas y selecciona `release`.

Opción (línea de comandos - Windows):

```bash
cd android
.\gradlew.bat bundleRelease
# o para APK:
.\gradlew.bat assembleRelease
```

Firmar manualmente (si fuera necesario)
- Si usas el asistente de Android Studio normalmente no necesitas firmar a mano.
- Si generas un `unsigned` APK, usa `apksigner` para firmarlo antes de subir.

Clave/keystore (IMPORTANTE)
- Guarda tu keystore en un lugar seguro y documenta su contraseña. Play Console lo requiere para actualizaciones.

Play Store — Checklist mínimo
- Nombre de la app: `Sistema de facturación` (ver `capacitor.config.js`)
- AAB firmado, iconos (512x512), screenshots (phone), descripción, categoría y política de privacidad.
- Política de privacidad: el proyecto incluye `privacy-policy.md`; revisa y súbela en Play Console.
- En la consola, revisa la sección de permisos y privacidad: la app no solicita permisos de red específicos para telemetría.

Privacidad y recolección de datos
- Auditoría rápida: no se han detectado bibliotecas de analítica (Sentry, Google Analytics, Mixpanel, etc.) en `src`.
- Persistencia local: `localStorage` y `@capacitor-community/sqlite` (SQLite) — datos permanecen en el dispositivo.
- Recomendación: si planeas añadir alguna integración remota en el futuro, documenta claramente qué datos se envían y solicita el consentimiento.

Integración SQLite
- El proyecto ya incluye `@capacitor-community/sqlite` en `package.json` y adaptadores SQLite en `src/infrastructure/sqliteAdapters.ts`.
- Tras `npx cap sync android`, abre Android Studio y verifica que el plugin esté agregado al proyecto nativo.

Editor de facturación (plantilla PDF / POS)
- Archivo de edición en UI: `src/presentation/pages/InvoiceEditor.tsx`.
- Lógica para construir tirilla POS y HTML/PDF: `src/infrastructure/invoiceTemplates.ts`.
- Para ajustar el texto que se imprime en PDF o tirilla POS 80, edita la plantilla desde la interfaz Editor o modifica `defaultInvoiceTemplate`.

Cambiar nombre/metadata
- `capacitor.config.js` ya tiene `appName: 'Sistema de facturacion'` y `appId: 'com.sistemafacturacion.celu'`.
- Actualiza íconos y `android/app/src/main/res` si deseas personalizar recursos nativos.

Comandos útiles resumen

```bash
npm install
npm run build
npx cap sync android
npx cap open android   # abre Android Studio
# (desde android/ en Windows)
.\gradlew.bat bundleRelease   # genera AAB
# o
.\gradlew.bat assembleRelease # genera APK
```

Notas finales
- He verificado que la versión móvil no incluya telemetría conocida. Si quieres que elimine artefactos de `dist/` o realice ajustes adicionales (iconos, store listing, screenshots), indícamelo y lo preparo.

Archivos relevantes
- Editor: `src/presentation/pages/InvoiceEditor.tsx`
- Plantilla: `src/infrastructure/invoiceTemplates.ts`
- SQLite adapters añadidos: `src/infrastructure/sqliteAdapters.ts`
- Capacitor config: `capacitor.config.js`

*** Fin del documento
