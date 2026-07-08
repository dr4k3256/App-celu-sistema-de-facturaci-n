const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');

// Fix Sales.tsx
let salesPath = path.join(srcDir, 'Sales.tsx');
let salesContent = fs.readFileSync(salesPath, 'utf8');
if (salesContent.includes('const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {\n                <div className="space-y-3')) {
    salesContent = salesContent.replace(
        'const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {\n                <div className="space-y-3',
        `const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {\n    const { t } = useTranslation();\n    if (!isOpen || !product) return null;\n\n    return (\n        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">\n            <div className="glass w-full max-w-md p-6 border-t-4 border-blue-500">\n                <h3 className="text-xl font-bold mb-4">Seleccionar Variante</h3>\n                <p className="text-sm text-muted-foreground mb-6">{product.name} - REF: {product.id}</p>\n\n                <div className="space-y-3`
    );
    fs.writeFileSync(salesPath, salesContent);
    console.log("Fixed Sales.tsx missing lines");
}

const files = [
    'Finances.tsx', 'Quotes.tsx', 'Expenses.tsx', 
    'Dashboard.tsx', 'Credits.tsx', 'Facturas.tsx', 'Catalog.tsx'
];

for (const file of files) {
    const p = path.join(srcDir, file);
    if (!fs.existsSync(p)) continue;
    
    let content = fs.readFileSync(p, 'utf8');
    
    let changed = false;
    
    // Replace: $ {xxx?.toLocaleString() || 0}
    const regex1 = /\$\s*\{([^}]+?)\.toLocaleString\(\)(\s*\|\|\s*0)?\}/g;
    content = content.replace(regex1, (match, p1, p2) => {
        changed = true;
        // p1 could be `product.normalPrice?` or `total`
        // if it has `?`, we should probably wrap it
        let expr = p1;
        if (p2) {
            expr = `${p1}${p2}`;
        }
        return `{formatMoney(${expr})}`;
    });

    // Replace: `$ ${(stats?.todaySales || 0).toLocaleString()}`
    const regex2 = /\$\s*\$\{\(([^}]+?)\)\.toLocaleString\(\)\}/g;
    content = content.replace(regex2, (match, p1) => {
        changed = true;
        return `\${formatMoney(${p1})}`;
    });

    // Replace: `$ ${(c.amount - c.paidAmount).toLocaleString()}`
    const regex3 = /\$\s*\{\(([^}]+?)\)\.toLocaleString\(\)\}/g;
    content = content.replace(regex3, (match, p1) => {
        changed = true;
        return `{formatMoney(${p1})}`;
    });
    
    if (changed) {
        if (!content.includes('formatMoney')) {
            content = "import { formatMoney } from '../../infrastructure/invoiceTemplates';\n" + content;
        }
        fs.writeFileSync(p, content);
        console.log(`Replaced currency in ${file}`);
    }
}
