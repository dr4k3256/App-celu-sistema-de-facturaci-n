const fs = require('fs');
const path = require('path');

const pages = ['Catalog.tsx', 'Dashboard.tsx', 'Credits.tsx', 'Finances.tsx', 'Quotes.tsx', 'Expenses.tsx', 'Facturas.tsx', 'Sales.tsx'];
const dir = path.join(__dirname, 'src', 'presentation', 'pages');

for (const f of pages) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) continue;
    let src = fs.readFileSync(fp, 'utf8');
    const before = src;

    // Fix: formatMoney(product.normalPrice? || 0) → formatMoney(product.normalPrice || 0)
    // The regex captures anything ending in ? before || or )
    src = src.replace(/formatMoney\(([^)]+?)\?\s*(\|\|\s*[^)]+)?\)/g, function(match, expr, fallback) {
        const cleaned = expr.replace(/\?$/, '').trim();
        if (fallback) {
            return 'formatMoney(' + cleaned + ' ' + fallback.trim() + ')';
        }
        return 'formatMoney(' + cleaned + ')';
    });

    // Fix: formatMoney(expr?.toLocaleString()) → formatMoney(expr)
    src = src.replace(/formatMoney\(([^)]+?)\.toLocaleString\(\)\)/g, function(match, expr) {
        return 'formatMoney(' + expr.trim() + ')';
    });

    if (src !== before) {
        fs.writeFileSync(fp, src);
        console.log('Fixed: ' + f);
    } else {
        console.log('No changes: ' + f);
    }
}
console.log('Done.');
