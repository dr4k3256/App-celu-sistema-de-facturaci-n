const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');

const replacements = {
  // Common Toast errors
  'Ingrese un nombre de cliente válido': "{t('clients.invalidName') || 'Invalid name'}",
  'No se pudo cargar la lista de clientes': "{t('clients.fetchError') || 'Error fetching clients'}",
  'Error al guardar el cliente': "{t('clients.saveError') || 'Error saving client'}",
  
  // Table Headers
  'Nombre': "{t('catalog.name') || 'Name'}",
  'Precio Normal': "{t('catalog.price') || 'Normal Price'}",
  'Precio Mayorista': "{t('catalog.wholesalePrice') || 'Wholesale Price'}",
  'Variantes': "{t('catalog.variants') || 'Variants'}",
  'StockTotal': "{t('catalog.stock') || 'Total Stock'}",
  'Fecha': "{t('common.date') || 'Date'}",
  'Cliente': "{t('sales.client') || 'Client'}",
  'Total': "{t('common.total') || 'Total'}",
  'TOTAL': "{t('common.total') || 'TOTAL'}",
  'FINALIZAR VENTA': "{t('sales.process') || 'FINALIZE SALE'}",
  'REGISTRAR GASTO': "{t('expenses.addExpense') || 'REGISTER EXPENSE'}",
  'NUEVO CRÉDITO': "{t('credits.newCredit') || 'NEW CREDIT'}",

  // Specific buttons or hardcoded words
  'Monto': "{t('expenses.amount') || 'Amount'}",
  'Descripción': "{t('expenses.description') || 'Description'}"
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useTranslation if not present
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
        // String literal replacements
        content = content.split(`'${es}'`).join(en.replace(/^{|}$/g, ''));
        content = content.split(`"${es}"`).join(en.replace(/^{|}$/g, ''));
        // JSX Text replacements
        content = content.split(`>${es}<`).join(`>${en}<`);
    }
    
    fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    processFile(fullPath);
});
console.log('Final translations applied');
