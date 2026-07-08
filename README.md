# Sistema de facturacion movil

Copia movil de la aplicacion de facturacion. Esta preparada para funcionar sin servidor, sin recoleccion de datos y con persistencia local. La configuracion Android esta en `capacitor.config.js`.

## Uso

```bash
npm install
npm run build
npm run android:sync
npm run android:open
```

Desde Android Studio se genera el APK/AAB para Play Store.

## Datos

La app guarda productos, ventas, clientes, gastos, creditos y plantilla de factura en el dispositivo. `sqlite-schema.sql` documenta la estructura SQLite prevista para el empaquetado movil.
