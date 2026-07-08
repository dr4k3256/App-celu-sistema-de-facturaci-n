const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'presentation', 'pages');
fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.tsx')) return;
    let c = fs.readFileSync(path.join(dir, f), 'utf8');
    if (c.includes('formatMoney') && !c.includes('import { formatMoney }')) {
        c = "import { formatMoney } from '../../infrastructure/invoiceTemplates';\n" + c;
        fs.writeFileSync(path.join(dir, f), c);
        console.log('Added formatMoney to ' + f);
    }
});
