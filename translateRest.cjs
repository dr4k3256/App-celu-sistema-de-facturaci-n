const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');

const replacements = {
  // Sales
  'Punto de Venta': "{t('sales.title')}",
  'Buscar producto... (Nombre o Código)': "Search product...",
  'Precio: $': "Price: $",
  'Cliente General': "{t('sales.generalClient')}",
  'Procesar Venta': "{t('sales.process')}",
  'Vaciar Carrito': "Empty Cart",
  'Confirmar Venta': "Confirm Sale",
  'Nueva Venta': "{t('sales.newSale')}",

  // Facturas / Invoices
  'Facturas': "{t('invoices.title')}",
  'Crear Factura Libre': "{t('invoices.createInvoice')}",
  
  // Finances
  'Reportes y Finanzas': "{t('finances.title')}",
  'Resumen del Mes': "{t('finances.report')}",
  'Ventas Totales': "Total Sales",
  'Gastos Totales': "Total Expenses",
  'Utilidad Neta': "{t('finances.profit')}",

  // Quotes
  'Cotizaciones': "{t('quotes.title')}",
  'Nueva Cotización': "{t('quotes.newQuote')}",
  'Imprimir Cotización': "Print Quote",

  // Stock Movements
  'Movimientos de Stock': "{t('stock.title')}",
  'Buscar movimientos...': "Search movements...",
  'Registrar Movimiento': "{t('stock.addMovement')}",
  
  // General text
  'Cargando': "{t('common.loading')}",
  'Guardar': "{t('common.save')}",
  'Cancelar': "{t('common.cancel')}",
  'Acciones': "{t('common.actions')}"
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('useTranslation')) {
        content = content.replace("import React", "import React\nimport { useTranslation } from 'react-i18next';");
    }

    const componentRegex = /const ([A-Z][a-zA-Z0-9_]*) = \([^)]*\) => {/g;
    content = content.replace(componentRegex, (match) => {
        if (!content.includes('const { t } = useTranslation();')) {
            return `${match}\n    const { t } = useTranslation();`;
        }
        return match;
    });

    for (const [es, en] of Object.entries(replacements)) {
        content = content.split(`>${es}<`).join(`>${en}<`);
        content = content.split(`"${es}"`).join(`"${en}"`);
        content = content.split(`'${es}'`).join(`'${en}'`);
        content = content.split(`placeholder="${es}"`).join(`placeholder="${en}"`);
    }

    content = content.replace(/const \{ t \} = useTranslation\(\);\s*const \{ t \} = useTranslation\(\);/g, "const { t } = useTranslation();");
    
    fs.writeFileSync(filePath, content);
}

const files = ['Sales.tsx', 'Facturas.tsx', 'Finances.tsx', 'Quotes.tsx', 'StockMovements.tsx'];
files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
        console.log('Processed', f);
    }
});
