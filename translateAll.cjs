const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');

const replacements = {
  'Catálogo de Productos': "{t('catalog.title')}",
  'Exportar Productos (Excel)': "Export (Excel)",
  'Importar Productos (Excel)': "Import (Excel)",
  'Nuevo Producto': "{t('catalog.addProduct')}",
  'Buscar por ID o nombre...': "{t('catalog.search')}",
  'Buscar': "{t('common.search')}",
  'Limpiar': "Clear",
  'Producto': "{t('catalog.name')}",
  'Categoría': "{t('catalog.category')}",
  'P. Venta': "{t('catalog.price')}",
  'P. Mayor': "{t('catalog.wholesalePrice')}",
  'Stock': "{t('catalog.stock')}",
  'Acciones': "{t('common.actions')}",
  'Cargando productos...': "{t('common.loading')}",
  'No se encontraron productos': "{t('catalog.noProducts')}",
  'Ver Detalle': "View Detail",
  'Editar': "{t('common.edit')}",
  'Eliminar': "{t('common.delete')}",
  'Registros:': "Records:",
  'Anterior': "Previous",
  'Siguiente': "Next",

  'Nueva Venta': "{t('sales.newSale')}",
  'Buscar producto... (Nombre o Código)': "Search product...",
  'Precio: $': "Price: $",
  'Cliente General': "{t('sales.generalClient')}",
  'Procesar Venta': "{t('sales.process')}",
  'Vaciar Carrito': "Empty Cart",
  'Confirmar Venta': "Confirm Sale",

  'Gastos': "{t('expenses.title')}",
  'Nuevo Gasto': "{t('expenses.addExpense')}",
  'Descripción del gasto': "{t('expenses.description')}",
  'Monto': "{t('expenses.amount')}",
  'Guardar Gasto': "Save Expense",

  'Créditos': "{t('credits.title')}",
  'Nuevo Crédito': "{t('credits.newCredit')}",
  'Abonar': "{t('credits.addInstallment')}",
  'Total Deuda:': "Total Debt:",
  'Estado': "{t('credits.status')}",
  'PENDIENTE': "{t('credits.pending')}",
  'PAGADO': "{t('credits.paid')}",
  'Monto a abonar': "Amount to pay",
  'Confirmar Abono': "Confirm Payment",

  'Historial de Ventas': "Sales History",
  'Revertir': "{t('sales.revert')}",
  'REVERTIDA': "{t('sales.reverted')}",

  'Reportes y Finanzas': "{t('finances.title')}",
  'Resumen del Mes': "{t('finances.report')}",
  'Ventas Totales': "Total Sales",
  'Utilidad Neta': "{t('finances.profit')}",

  'S/G': "N/A"
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useTranslation if not present
    if (!content.includes('useTranslation')) {
        content = content.replace("import React", "import React\nimport { useTranslation } from 'react-i18next';");
    }

    // A hacky way to inject `const { t } = useTranslation();` into main components
    const componentRegex = /const ([A-Z][a-zA-Z0-9_]*) = \([^)]*\) => {/g;
    content = content.replace(componentRegex, (match) => {
        return `${match}\n    const { t } = useTranslation();`;
    });

    for (const [es, en] of Object.entries(replacements)) {
        // Handle >Text< 
        content = content.split(`>${es}<`).join(`>${en}<`);
        content = content.split(`"${es}"`).join(`"${en}"`);
        content = content.split(`'${es}'`).join(`'${en}'`);
        content = content.split(`placeholder="${es}"`).join(`placeholder="${en}"`);
        content = content.split(`title="${es}"`).join(`title="${en}"`);
    }

    // Fix possible double declarations of t
    content = content.replace(/const \{ t \} = useTranslation\(\);\s*const \{ t \} = useTranslation\(\);/g, "const { t } = useTranslation();");
    
    fs.writeFileSync(filePath, content);
}

const files = ['Catalog.tsx', 'POS.tsx', 'Expenses.tsx', 'Credits.tsx', 'History.tsx', 'Reports.tsx'];
files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
        console.log('Processed', f);
    }
});
