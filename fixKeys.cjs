const fs = require('fs');
const path = require('path');

const f = path.join(__dirname, 'src', 'presentation', 'pages', 'Catalog.tsx');
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/t\('catalog\.price'\) \|\| 'Normal Price':/g, "[t('catalog.price') || 'Normal Price']:");
c = c.replace(/t\('catalog\.wholesalePrice'\) \|\| 'Wholesale Price':/g, "[t('catalog.wholesalePrice') || 'Wholesale Price']:");
c = c.replace(/t\('catalog\.variants'\) \|\| 'Variants':/g, "[t('catalog.variants') || 'Variants']:");
c = c.replace(/t\('catalog\.stock'\) \|\| 'Total Stock':/g, "[t('catalog.stock') || 'Total Stock']:");
c = c.replace(/t\('catalog\.name'\) \|\| 'Name':/g, "[t('catalog.name') || 'Name']:");

// Other files might have it too
const f2 = path.join(__dirname, 'src', 'presentation', 'pages', 'Sales.tsx');
if (fs.existsSync(f2)) {
    let c2 = fs.readFileSync(f2, 'utf8');
    c2 = c2.replace(/t\('sales\.client'\) \|\| 'Client':/g, "[t('sales.client') || 'Client']:");
    c2 = c2.replace(/t\('common\.total'\) \|\| 'Total':/g, "[t('common.total') || 'Total']:");
    c2 = c2.replace(/t\('common\.date'\) \|\| 'Date':/g, "[t('common.date') || 'Date']:");
    fs.writeFileSync(f2, c2);
}

fs.writeFileSync(f, c);
console.log('Fixed object keys');
