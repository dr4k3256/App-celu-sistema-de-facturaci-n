const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'presentation', 'pages', 'Catalog.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("'{t('catalog.addProduct')}'", "t('catalog.addProduct')");
fs.writeFileSync(file, content);

console.log('Fixed syntax in Catalog.tsx');
